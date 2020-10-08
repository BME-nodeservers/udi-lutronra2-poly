'use strict';

let RadioRa2 = require('../lib/radiora2');
const EventEmitter = require('events').EventEmitter;
const util = require('util');

var lutronEvents = require('../lib/lutronEvents.js');
var lutronEmitter = lutronEvents.lutronEmitter;
var radiora2 = new RadioRa2();

// The controller node is a regular ISY node. It must be the first node created
// by the node server. It has an ST status showing the nodeserver status, and
// optionally node statuses. It usually has a few commands on the node to
// facilitate interaction with the nodeserver from the admin console or
// ISY programs.

// nodeDefId must match the nodedef id in your nodedef
const nodeDefId = 'CONTROLLER';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;
  const MaestroDimmerNode = require('./MaestroDimmerNode.js')(Polyglot);

  class Controller extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.commands = {
        CREATE_NEW: this.onCreateNew,
        DISCOVER: this.onDiscover,
        UPDATE_PROFILE: this.onUpdateProfile,
        REMOVE_NOTICES: this.onRemoveNotices,
        QUERY: this.query,
      };

      this.drivers = {
        ST: { value: '1', uom: 2 }, // uom 2 = Boolean. '1' is True.
      };

      this.isController = true;
      this.getDevices();
      this.repeaterSetup();

    }

    repeaterSetup() {
      var host = null;
      var username = null;
      var password = null;
      var type = null;

      const config = this.polyInterface.getConfig();
      const myConfig = Object(config.typedCustomData);
      const repeaters = Object(myConfig.repeaters);
      const confKeys = Object.values(repeaters);

      for (var key of confKeys) {
        var _ipJoin = key.ipAddress.toString().replace(/\./g, '');
        var _repeaterUID = _ipJoin.substring(_ipJoin.length - 3);
        var _address = 'lip' + _repeaterUID;

        if (this.address === _address) {
          host = key.ipAddress;
          username = key.username;
          password = key.password;
          type = 'RadioRa2';
          try {
            this.LutronConnect(host, username, password);
          } catch (err) {
            logger.errorStack(err, 'Connection to Main Repeater Failed');
          }
        }
      }
    }

    getDevices() {
      const config = this.polyInterface.getConfig();
      const myConfig = Object(config.typedCustomData);
      const repeaters = Object(myConfig.repeaters);
      const confKeys = Object.values(repeaters);

      for (var key of confKeys) {
        var _ipJoin = key.ipAddress.toString().replace(/\./g, '');
        var _repeaterUID = _ipJoin.substring(_ipJoin.length - 3);
        var _address = 'lip' + _repeaterUID;

        if (this.address === _address) {
          if (Object.values(key.devices).length > 0) {
            const devKeys = Object.values(key.devices);
            logger.info('devs: ' + devKeys);
            for (var key of devKeys) {
              logger.info('Dev Key name: ' + key.name);
              logger.info('Dev Key integrationID: ' + key.intId);
              logger.info('Dev Key deviceType: ' + key.devType);
              this.createDevice(key.intId, key.devType, key.name);
            }
          }
        }
      }
    }

    async createDevice(intId, devType, devName) {
      const prefix = 'id_';
      var _address = this.address + prefix + intId;
      var _devName = devName;
      var _devType = devType;

      try {
        const result = await this.polyInterface.addNode(
          new MaestroDimmerNode(this.polyInterface, this.address,
            _address, _devName)
        );

        logger.info('Add node worked: %s', result);
      } catch (err) {
        logger.errorStack(err, 'Add node failed:');
      }
    }

    // Here you could discover devices from a 3rd party API
    onDiscover() {
      logger.info('Discovering');
    }

    // Sends the profile files to ISY
    onUpdateProfile() {
      this.polyInterface.updateProfile();
    }

    // Removes notices from the Polyglot UI
    onRemoveNotices() {
      this.polyInterface.removeNoticesAll();
    }

    LutronConnect(host, username, password) {
      // const prefix = "id";
      // const nodes = this.polyInterface.getNodes();


      // var radiora2 = new RadioRa2();

      logger.info('Attempting Lutron Connection');
      // radiora2.connect(host, username, password);

      // Begin Listeners
      radiora2.on('messageReceived', function(data) {
        logger.info('LUTRON ' + data);
      });

      radiora2.on('loggedIn', function() {
        logger.info('Connected to Lutron');
      });

      radiora2.on('sent', function(data) {
        logger.info('Message Sent' + data);
      });

      radiora2.on('debug', function(data) {
        logger.info(data);
      });

      radiora2.on('info', function(data) {
        logger.info(data);
      });

      radiora2.on('warn', function(data) {
        logger.info(data);
      });

      radiora2.on('error', function(data) {
        logger.info(data);
      });

      radiora2.on('on', function(id) {
        // logger.info(id);
        var nodeAddr = this.address + 'id_' + id;
        var node = this.polyInterface.getNode(nodeAddr);
        if (node) {
          logger.info('Received for Node: ' + nodeAddr);
          node.setDriver('ST', '100');
        }

      }.bind(this));

      radiora2.on('off', function(id) {
        // logger.info(id);
        var nodeAddr = this.address + 'id_' + id;
        var node = this.polyInterface.getNode(nodeAddr);
        if (node) {
          logger.info('Received for Node: ' + nodeAddr);
          node.setDriver('ST', '0');
        }

      }.bind(this));

      radiora2.on('level', function(id, level) {
        // logger.info("ID: " + id + " Level: " + level);
        var nodeAddr = this.address + 'id_' + id;
        var node = this.polyInterface.getNode(nodeAddr);
        if (node) {
          logger.info('Received for Node: ' + nodeAddr);
          node.setDriver('ST', Math.round(level));
        }
      }.bind(this));

      radiora2.on('buttonPress', function(data) {
        logger.info(data);
      });

      radiora2.on('buttonReleased', function(data) {
        logger.info(data);
      });

      radiora2.on('buttonHold', function(data) {
        logger.info(data);
      });

      radiora2.on('keypadbuttonLEDOn', function(data) {
        logger.info(data);
      });

      radiora2.on('keypadbuttonLEDOff', function(data) {
        logger.info(data);
      });

      radiora2.on('groupOccupied', function(data) {
        logger.info(data);
      });

      radiora2.on('groupUnoccupied', function(data) {
        logger.info(data);
      });

      radiora2.on('groupUnknown', function(data) {
        logger.info(data);
      });


      // Receive Events from ISY Admin Console
      lutronEmitter.on('query', function(id){
        radiora2.queryOutputState(id);
      });

      lutronEmitter.on('on', function(id) {
        logger.info('Node On Message: ' + id);
        radiora2.setSwitch(id, 100);
        // radiora2.setSwitchOn(id);
      });

      lutronEmitter.on('off', function(id) {
        logger.info('Node Off Message: ' + id);
        radiora2.setSwitch(id, 0);
        // radiora2.setSwitchOff(id);
      });

      lutronEmitter.on('level', function(id, level) {
        logger.info('Node Level Message: ' + id + ' Level:' + level);
        radiora2.setDimmer(id, level);
      });

      lutronEmitter.on('fdup', function(id) {
        radiora2.startRaising(id);
      });

      lutronEmitter.on('fddown', function(id) {
        radiora2.startLowering(id);
      });

      lutronEmitter.on('fdstop', function(id) {
        radiora2.stopRaiseLower(id);
      });

      // Connect to Main Repeater
      radiora2.connect(host, username, password);
      // return;
    }

  };

  // lutronEmitter.on('on', function(message) {
  //   logger.info('Node Message: ' + message);
  //   // radiora2.setSwitch(id, on)
  // });

  lutronEmitter.on('level', function(message) {
    logger.info('Node Level Message: ' + message);
  });

  // Required so that the interface can find this Node class using the nodeDefId
  Controller.nodeDefId = nodeDefId;

  return Controller;
};


// Those are the standard properties of every nodes:
// this.id              - Nodedef ID
// this.polyInterface   - Polyglot interface
// this.primary         - Primary address
// this.address         - Node address
// this.name            - Node name
// this.timeAdded       - Time added (Date() object)
// this.enabled         - Node is enabled?
// this.added           - Node is added to ISY?
// this.commands        - List of allowed commands
//                        (You need to define them in your custom node)
// this.drivers         - List of drivers
//                        (You need to define them in your custom node)

// Those are the standard methods of every nodes:
// Get the driver object:
// this.getDriver(driver)

// Set a driver to a value (example set ST to 100)
// this.setDriver(driver, value, report=true, forceReport=false, uom=null)

// Send existing driver value to ISY
// this.reportDriver(driver, forceReport)

// Send existing driver values to ISY
// this.reportDrivers()

// When we get a query request for this node.
// Can be overridden to actually fetch values from an external API
// this.query()

// When we get a status request for this node.
// this.status()
