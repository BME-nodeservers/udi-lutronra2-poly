'use strict';

let RadioRa2 = require('../lib/radiora2');
const EventEmitter = require('events').EventEmitter;
const util = require('util');

// The controller node is a regular ISY node. It must be the first node created
// by the node server. It has an ST status showing the nodeserver status, and
// optionally node statuses. It usually has a few commands on the node to
// facilitate interaction with the nodeserver from the admin console or
// ISY programs.

// nodeDefId must match the nodedef id in your nodedef
const nodeDefId = 'CONTROLLER';

module.exports = function(Polyglot) {
  // Utility function provided to facilitate logging.
  const logger = Polyglot.logger;

  // In this example, we also need to have our custom node because we create
  // nodes from this controller. See onCreateNew
  // const MyNode = require('./MyNode.js')(Polyglot);
  const MaestroDimmerNode = require('./MaestroDimmerNode.js')(Polyglot);
  // var dimmer = require('./MaestroDimmerNode.js')(emitCommands);

  class Controller extends Polyglot.Node {
    // polyInterface: handle to the interface
    // address: Your node address, withouth the leading 'n999_'
    // primary: Same as address, if the node is a primary node
    // name: Your node name
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      // Commands that this controller node can handle.
      // Should match the 'accepts' section of the nodedef.
      this.commands = {
        CREATE_NEW: this.onCreateNew,
        DISCOVER: this.onDiscover,
        UPDATE_PROFILE: this.onUpdateProfile,
        REMOVE_NOTICES: this.onRemoveNotices,
        QUERY: this.query,
      };

      // Status that this controller node has.
      // Should match the 'sts' section of the nodedef.
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
        var _ipJoin = key.ipAddress.toString().replace(/\./g, "");
        var _repeaterUID = _ipJoin.substring(_ipJoin.length - 3);
        var _address = 'lip' + _repeaterUID;

        if (this.address === _address) {
          host = key.ipAddress;
          username = key.username;
          password = key.password;
          type = "RadioRa2";
          try {
            this.LutronConnect(host, username, password);
          } 
          catch(err) {
            logger.errorStack(err, "Connection to Main Repeater Failed");
          }
        }
      }
      // Disabled while testing configuration parameters
      
    }

    getDevices() {
      const config = this.polyInterface.getConfig();
      const myConfig = Object(config.typedCustomData);
      const repeaters = Object(myConfig.repeaters);
      const confKeys = Object.values(repeaters);

      for (var key of confKeys) {
        var _ipJoin = key.ipAddress.toString().replace(/\./g, "");
        var _repeaterUID = _ipJoin.substring(_ipJoin.length - 3);
        var _address = 'lip' + _repeaterUID;

        if (this.address === _address) {
          if (Object.values(key.devices).length > 0) {
            const devKeys = Object.values(key.devices);
            logger.info("devs: " + devKeys);
            for (var key of devKeys) {
              logger.info("Dev Key name: " + key.name);
              logger.info("Dev Key integrationID: " + key.intId);
              logger.info("Dev Key deviceType: " + key.deviceType);
              this.createDevice(key.intId, key.name);
            }
          }
          
        }
      }
    }

    async createDevice(intId, devName) {
      const prefix = 'id';
      var _address = prefix + intId;
      var _devName = devName;
      // const nodes = this.polyInterface.getNodes();

      try {
        const result = await this.polyInterface.addNode(
          // new MyNode(this.polyInterface, this.address, _address, _devName)
          new MaestroDimmerNode(this.polyInterface, this.address, _address, _devName)
        );

        logger.info('Add node worked: %s', result);
      } catch (err) {
        logger.errorStack(err, 'Add node failed:');
      }
    }

    // Creates a new node using MyNode class, using a sequence number.
    // It needs to be an async function because we use the
    // this.polyInterface.addNode async function
    // async onCreateNew() {
    //   const prefix = 'node';
    //   const nodes = this.polyInterface.getNodes();

    //   // Finds the first available address and creates a node.
    //   for (let seq = 0; seq < 999; seq++) {
    //     // address will be <prefix><seq>
    //     const address = prefix + seq.toString().padStart(3, '0');

    //     if (!nodes[address]) {
    //       // ISY Address will be n<profileNum>_<prefix><seq>
    //       // name will be <prefix><seq>
    //       try {
    //         const result = await this.polyInterface.addNode(
    //           new MyNode(this.polyInterface, this.address, address, address)
    //         );

    //         logger.info('Add node worked: %s', result);
    //       } catch (err) {
    //         logger.errorStack(err, 'Add node failed:');
    //       }
    //       break;
    //     }
    //   }
    // }

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

    lutronPrint(data) {
      logger.info("TESt ========== " + data);
    }
  // };

  // function LutronConnect(host, username, password) {
  // LutronConnect(host, username, password) {
  LutronConnect(host, username, password) {

    // Get My nodes
    const prefix = "id";

    logger.info("Attempting Lutron Connection");
    logger.info("Passed Host: " + host);

    var radiora2 = new RadioRa2();

    radiora2.on("messageReceived", function (data) {
      logger.info("LUTRON " + data);
    }.bind(this));

    // radiora2.connect(host, username, password);

    radiora2.on("loggedIn", function() {
      logger.info("Connected to Lutron");
    }.bind(this));

    radiora2.on("debug", function(data) {
      logger.info(data);
    }.bind(this));

    radiora2.on("info", function(data) {
      logger.info(data);
    }.bind(this));

    radiora2.on("warn", function(data) {
      logger.info(data);
    }.bind(this));

    radiora2.on("error", function(data) {
      logger.info(data);
    }.bind(this));

    radiora2.on("on", function(data) {
      logger.info(data);
      this.lutronPrint(data);

    }.bind(this));

    radiora2.on("off", function(data) {
      logger.info(data);
    }.bind(this));

    radiora2.on("level", function(data) {
      logger.info(data);
    }.bind(this));

    radiora2.on("buttonPress", function(data) {
      logger.info(data);
    }.bind(this));

    radiora2.on("buttonReleased", function(data) {
      logger.info(data);
    }.bind(this));

    radiora2.on("buttonHold", function(data) {
      logger.info(data);
    }.bind(this));

    radiora2.on("keypadbuttonLEDOn", function(data) {
      logger.info(data);
    }.bind(this));

    radiora2.on("keypadbuttonLEDOff", function(data) {
      logger.info(data);
    }.bind(this));

    radiora2.on("groupOccupied", function(data) {
      logger.info(data);
    }.bind(this));

    radiora2.on("groupUnoccupied", function(data) {
      logger.info(data);
    }.bind(this));

    radiora2.on("groupUnknown", function(data) {
      logger.info(data);
    }.bind(this));

    radiora2.connect(host, username, password);


    return;
  }

};


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
