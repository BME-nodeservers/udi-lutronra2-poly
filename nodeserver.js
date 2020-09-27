'use strict';

trapUncaughExceptions();

const fs = require('fs');
const markdown = require('markdown').markdown; // For Polyglot-V2 only
const AsyncLock = require('async-lock');

// Loads the appropriate Polyglot interface module.
const Polyglot = require('polyinterface');

// If your nodeserver only supports the cloud, use pgc_interface only.

// Use logger.<debug|info|warn|error>()
const logger = Polyglot.logger;
const lock = new AsyncLock({ timeout: 500 });

// Those are the node definitions that our nodeserver uses.
// You will need to edit those files.
const ControllerNode = require('./Nodes/ControllerNode.js')(Polyglot);
// const MyNode = require('./Nodes/MyNode.js')(Polyglot);
const MainRepeaterNode = require('./Nodes/MainRepeaterNode.js')(Polyglot);
const MaestroDimmerNode = require('./Nodes/MaestroDimmerNode.js')(Polyglot);

const typedParams = [
  { name: 'repeaters', title: 'Lutron Repeaters / Bridges', isList: true, 
  params: 
  [
    {name: 'name', title: 'Repeater Name', type: 'STRING', 
      desc: 'Name as it will appear in ISY'},
    {name: 'ipAddress', title: 'Repeater IP Address', type: 'STRING', 
      desc: ''},
    {name: 'username', title: 'Username', type: 'STRING',
      desc: ''},
    {name: 'password', title: 'Password', type: 'STRING',
      desc: ''},
    { name: 'devices', title: 'Lutron Devices', isList: true, 
      params: 
      [
        {name: 'name', title: 'Device Name', type: 'STRING', 
          desc: 'Name as it will appear in ISY'},
        {name: 'intId', title: 'Integration ID', type: 'NUMBER', 
          desc: 'Enter the device ID found in the Integration Report'},
        // {name: 'deviceType', title: 'Device Type', type: 'NUMBER',
        //   desc: 'Switch = X, Dimmer = Y, Occupancy = Z'},
      ]
    },
  ]
  }
];

logger.info('Starting Lutron Node Server');

const poly = new Polyglot.Interface([ControllerNode, MainRepeaterNode, MaestroDimmerNode]);

poly.on('mqttConnected', function() {
  logger.info('MQTT Connection started');
});

poly.on('config', function(config) {
  const nodesCount = Object.keys(config.nodes).length;
  logger.info('Config received has %d nodes', nodesCount);

  // If this is the first config after a node server restart
  if (config.isInitialConfig) {
    poly.removeNoticesAll();

    // Sets the configuration fields in the UI / Available in Polyglot V2 only
    poly.saveTypedParams(typedParams);

    const md = fs.readFileSync('./configdoc.md');
    poly.setCustomParamsDoc(markdown.toHTML(md.toString()));

    // Sets the configuration fields in the UI
    // initializeCustomParams(config.customParams);

    // If we have no nodes yet, we add the first node: a controller node which
    // holds the node server status and control buttons The first device to
    // create should always be the nodeserver controller.
    if (!nodesCount) {
      try {
        logger.info('Auto-creating controller');
        callAsync(autoCreateController());
      } 
      catch(err) {
        logger.error('Error while auto-creating controller node:', err);
      }
    } 
    else { 
      if (Object.keys(config.typedCustomData).length > 0) {
        callAsync(CreateLutronControllers());
      }
    }

    if (config.newParamsDetected) {
      logger.info('New parameters detected');
    }
  } 
});

// This is triggered every x seconds. Frequency is configured in the UI.
poly.on('poll', function(longPoll) {
  callAsync(doPoll(longPoll));
});

// Received a 'stop' message from Polyglot. This NodeServer is shutting down
poly.on('stop', async function() {
  logger.info('Graceful stop');

  // Make a last short poll and long poll
  await doPoll(false);
  await doPoll(true);

  // Tell Interface we are stopping (Our polling is now finished)
  poly.stop();
});

// Received a 'delete' message from Polyglot. This NodeServer is being removed
poly.on('delete', function() {
  logger.info('Nodeserver is being deleted');

  // We can do some cleanup, then stop.
  poly.stop();
});

// MQTT connection ended
poly.on('mqttEnd', function() {
  logger.info('MQTT connection ended.'); // May be graceful or not.
});

// Triggered for every message received from polyglot.
poly.on('messageReceived', function(message) {
  // Only display messages other than config
  if (!message['config']) {
    // logger.debug('Message Received: %o', message);
  }
});

// Triggered for every message sent to polyglot.
poly.on('messageSent', function(message) {
  logger.debug('Message Sent: %o', message);
});

// This is being triggered based on the short and long poll parameters in the UI
async function doPoll(longPoll) {
  // Prevents polling logic reentry if an existing poll is underway
  try {
    await lock.acquire('poll', function() {
      logger.info('%s', longPoll ? 'Long poll' : 'Short poll');
    });
  } catch (err) {
    logger.error('Error while polling: %s', err.message);
  }
}

// Creates the controller node
async function autoCreateController() {
  try {
    await poly.addNode(
      new ControllerNode(poly, 'controller', 'controller', 'Lutron')
    );
  } 
  catch (err) {
    logger.error('Error creating controller node');
  }

  // Add a notice in the UI for 5 seconds
  poly.addNoticeTemp('newController', 'Controller node initialized', 5);
}

async function CreateLutronControllers() {
  const config = poly.getConfig();

  var configKeys = Object.keys(config.typedCustomData);
    if (configKeys.length > 0) {
 
      const mrKeys = Object.values(config.typedCustomData['repeaters']);
      if (mrKeys.length > 0) {
        logger.info("Main Repeaters: " + mrKeys.length);
        for (var key of mrKeys) {
          logger.info("Repeater Name: " + key.name);
          logger.info("Repeater IP: " + key.ipAddress);
          logger.info("Repeater Username: " + key.username);
          logger.info("Repeater Password: " + key.password);

          var ipJoin = key.ipAddress.toString().replace(/\./g, "");
          var repeaterUID = ipJoin.substring(ipJoin.length - 3);
          logger.info("Repeater UID: " + repeaterUID);
          var _address = 'lip' + repeaterUID;

          try {
            await poly.addNode(
              new MainRepeaterNode(poly, _address, _address, key.name)
            );
          } catch (err) {
            logger.errorStack(err, 'Error creating controller node');
          }
        }
      }
    }
}

// Sets the custom params as we want them. Keeps existing params values.
// function initializeCustomParams(currentParams) {
//   const defaultParamKeys = Object.keys(defaultParams);
//   const currentParamKeys = Object.keys(currentParams);

//   // Get orphan keys from either currentParams or defaultParams
//   const differentKeys = defaultParamKeys.concat(currentParamKeys)
//   .filter(function(key) {
//     return !(key in defaultParams) || !(key in currentParams);
//   });

//   if (differentKeys.length) {
//     let customParams = {};

//     // Only keeps params that exists in defaultParams
//     // Sets the params to the existing value, or default value.
//     defaultParamKeys.forEach(function(key) {
//       customParams[key] = currentParams[key] ?
//         currentParams[key] : defaultParams[key];
//     });

//     poly.saveCustomParams(customParams);
//   }
// }

// Call Async function from a non-asynch function without waiting for result,
// and log the error if it fails
function callAsync(promise) {
  (async function() {
    try {
      await promise;
    } catch (err) {
      logger.error('Error with async function: %s %s', err.message, err.stack);
    }
  })();
}

function trapUncaughExceptions() {
  // If we get an uncaugthException...
  process.on('uncaughtException', function(err) {
    logger.error(`uncaughtException REPORT THIS!: ${err.stack}`);
  });
}

// function useCloud() {
//   return process.env.MQTTENDPOINT && process.env.STAGE;
// }

// Starts the NodeServer!
poly.start();
