'use strict';

trapUncaughtExceptions();

const fs = require('fs');
const markdown = require('markdown').markdown; // For Polyglot-V2 only
const AsyncLock = require('async-lock');
const Polyglot = require('polyinterface');
const logger = Polyglot.logger;
const lock = new AsyncLock({ timeout: 500 });

const ControllerNode = require('./Nodes/ControllerNode.js')(Polyglot);
const MainRepeaterNode = require('./Nodes/MainRepeaterNode.js')(Polyglot);
const MaestroDimmerNode = require('./Nodes/MaestroDimmerNode.js')(Polyglot);
const MaestroSwitchNode = require('./Nodes/MaestroSwitchNode.js')(Polyglot);
const MaestroFanControlNode = require('./Nodes/MaestroFanControlNode')(Polyglot);
const Pico2BNode = require('./Nodes/Pico2BNode.js')(Polyglot);
const Pico2BRLNode = require('./Nodes/Pico2BRLNode.js')(Polyglot);
const Pico3BNode = require('./Nodes/Pico3BNode.js')(Polyglot);
const Pico3BRLNode = require('./Nodes/Pico3BRLNode.js')(Polyglot);
const Pico4BNode = require('./Nodes/Pico4BNode.js')(Polyglot);
const OccupancyNode = require('./Nodes/OccupancyNode.js')(Polyglot);
const RoomStatusNode = require('./Nodes/RoomStatusNode.js')(Polyglot);
const VCRXNode = require('./Nodes/VCRXNode.js')(Polyglot);
const VCRXButtonNode = require('./Nodes/VCRXButtonNode.js')(Polyglot);


const typedParams = [
  {name: 'name', title: 'Repeater Name', type: 'STRING',
    desc: 'Name as it will appear in ISY'},
  {name: 'ipAddress', title: 'Repeater IP Address', type: 'STRING',
    desc: ''},
  {name: 'username', title: 'Username', type: 'STRING',
    desc: ''},
  {name: 'password', title: 'Password', type: 'STRING',
    desc: ''},
  {name: 'reconnect', title: 'Restart Wait Time', type: 'NUMBER',
    desc: 'Time in Milliseconds to wait before restarting', defaultValue: '300000' },
  { name: 'devices', title: 'Lutron Devices', isList: true,
    params:
    [
      {name: 'name', title: 'Device Name', type: 'STRING',
        desc: 'Name as it will appear in ISY'},
      {name: 'intId', title: 'Integration ID', type: 'NUMBER',
        desc: 'Enter the device ID found in the Integration Report'},
      {name: 'devType', title: 'Device Type', type: 'NUMBER',
        desc: 'Switch = X, Dimmer = Y, Fan = X, KeyPad = X, ' +
          'Occupancy = Z, 2B Pico = X, 3B Pico = X, 4B Pico = X, ' +
          'Audio Pico = X'},
    ],
  },
];

logger.info('Starting Lutron Node Server');

const poly = new Polyglot.Interface([ControllerNode, MainRepeaterNode,
  MaestroDimmerNode, MaestroSwitchNode, MaestroFanControlNode, OccupancyNode,
  RoomStatusNode, Pico2BNode, Pico2BRLNode, Pico3BNode, Pico3BRLNode, Pico4BNode,
  VCRXNode, VCRXButtonNode,
  ]);
  // , MainRepeaterNode, MaestroDimmerNode, MaestroSwitchNode]);

poly.on('mqttConnected', function() {
  logger.info('MQTT Connection started');
});

poly.on('config', function(config) {
  const nodesCount = Object.keys(config.nodes).length;
  logger.info('Config received has %d nodes', nodesCount);

  if (config.isInitialConfig) {
    poly.removeNoticesAll();
    poly.saveTypedParams(typedParams);
    const md = fs.readFileSync('./configdoc.md');
    poly.setCustomParamsDoc(markdown.toHTML(md.toString()));
    
    // if (Object.keys(config.typedCustomData).length > 0) {
    //   callAsync(CreateLutronControllers());
    // }

    if (!nodesCount) {
      try {
        logger.info('Auto-creating controller');
        callAsync(autoCreateController());
      } catch (err) {
        logger.error('Error while auto-creating controller node:', err);
      }
    } else {
      if (Object.keys(config.typedCustomData).length > 0) {
        callAsync(CreateLutronControllers());
      }
    }

    if (config.newParamsDetected) {
      logger.info('New parameters detected');
    }
  }
});

poly.on('poll', function(longPoll) {
  callAsync(doPoll(longPoll));
});

poly.on('stop', async function() {
  logger.info('Graceful stop');

  // Make a last short poll and long poll
  await doPoll(false);
  await doPoll(true);

  // Tell Interface we are stopping (Our polling is now finished)
  poly.stop();
});

poly.on('delete', function() {
  logger.info('Nodeserver is being deleted');

  // We can do some cleanup, then stop.
  poly.stop();
});

poly.on('mqttEnd', function() {
  logger.info('MQTT connection ended.');
});

// Triggered for every message received from polyglot.
poly.on('messageReceived', function(message) {
  // Only display messages other than config
  if (!message['config']) {
    logger.debug('Message Received: %o', message);
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
      new ControllerNode(poly, 'controller', 'controller', 'RadioRA 2')
    );
  } catch (err) {
    logger.error('Error creating controller node');
  }

  // Add a notice in the UI for 5 seconds
  poly.addNoticeTemp('newController', 'Controller node initialized', 5);
}

async function CreateLutronControllers() {
  const _config = poly.getConfig();
  let config = Object(_config.typedCustomData);

  logger.info('Repeater Name: ' + config.name);
  logger.info('Repeater IP: ' + config.ipAddress);
  logger.info('Repeater Username: ' + config.username);
  logger.info('Repeater Password: ' + config.password);

  let _ipJoin = config.ipAddress.toString().replace(/\./g, '');
  let _repeaterUID = _ipJoin.substring(_ipJoin.length - 3);
  // let address = 'lip' + _repeaterUID;
  let address = _repeaterUID + '_1';;

  try {
    await poly.addNode(
      new MainRepeaterNode(poly, address, address, config.name)
    );
  } catch (err) {
    logger.errorStack(err, 'Error Creating Main Repeater Node');
  }
}

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

function trapUncaughtExceptions() {
  // If we get an uncaugthException...
  process.on('uncaughtException', function(err) {
    logger.error(`uncaughtException REPORT THIS!: ${err.stack}`);
  });
}

// Starts the NodeServer!
poly.start();
