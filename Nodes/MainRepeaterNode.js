'use strict';

const RadioRa2 = require('../lib/radiora2');
let radiora2 = new RadioRa2();

let lutronEvents = require('../lib/lutronEvents.js');
let lutronEmitter = lutronEvents.lutronEmitter;

const nodeDefId = 'CONTROLLER';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;
  const MaestroDimmerNode = require('./MaestroDimmerNode.js')(Polyglot);
  const MaestroSwitchNode = require('./MaestroSwitchNode.js')(Polyglot);

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
      this.repeaterSetup();
      this.getDevices();
    }

    repeaterSetup() {
      logger.info('repeaterSetup ===================================')
      logger.info('Begin Main Repeater Setup...');

      const _config = this.polyInterface.getConfig();
      const config = Object(_config.typedCustomData);

      let _host = config.ipAddress;
      let _username = config.username;
      let _password = config.password;

      // let _ipJoin = _host.toString().replace(/\./g, '');
      // let _repeaterUID = _ipJoin.substring(_ipJoin.length - 3);
      // let _address = 'lip' + _repeaterUID;

      logger.info('Host: ' + _host);
      logger.info('Username: ' + _username);
      logger.info('Password: ' + _password);
      
      // if (this.address === _address) {
      //   try {
      //     this.lutronConnect(_host, _username, _password);
      //   } catch (err) {
      //     logger.errorStack(err, 'Connection to Main Repeater Failed');
      //   }
      // }
      try {
        // this.lutronConnect(_host, _username, _password);
        radiora2.connect(_host, _username, _password);

      } catch (err) {
        logger.errorStack(err, 'Connection to Main Repeater Failed');
      }
      
    
      logger.info('repeaterSetup ===================================')

      // let host = null;
      // let username = null;
      // let password = null;
      // // let type = null;

      // const config = this.polyInterface.getConfig();
      // const myConfig = Object(config.typedCustomData);
      // const repeaters = Object(myConfig.repeaters);
      // const confKeys = Object.values(repeaters);

      // for (let key of confKeys) {
      //   let _ipJoin = key.ipAddress.toString().replace(/\./g, '');
      //   let _repeaterUID = _ipJoin.substring(_ipJoin.length - 3);
      //   let _address = 'lip' + _repeaterUID;

      //   if (this.address === _address) {
      //     host = key.ipAddress;
      //     username = key.username;
      //     password = key.password;
      //     // type = 'RadioRa2';
      //     try {
      //       this.lutronConnect(host, username, password);
      //     } catch (err) {
      //       logger.errorStack(err, 'Connection to Main Repeater Failed');
      //     }
      //   }
      // }
    }

    getDevices() {
      const _config = this.polyInterface.getConfig();
      const config = Object(_config.typedCustomData);
      const devices = Object(config.devices);

      let devKeys = Object.values(devices);
      for (let key of devKeys) {
        logger.info('Name: ' + key.name);
        logger.info('Integration ID: ' + key.intId);
        logger.info('Device Type: ' + key.devType);
        try {
          this.createDevice(key.intId, key.devType, key.name);
        } catch (err) {
          logger.errorStack(err, 'Device Create Failed: ' + key.name);
        }
      }
    }

    async createDevice(intId, devType, devName) {
      const prefix = 'id_';
      let _address = this.address + prefix + intId;
      let lutronId = _address.split('_')[1];
      let _devName = devName;
      let _devType = devType;

      if (_devType === 8) {
        try {
          const result = await this.polyInterface.addNode(
            new MaestroSwitchNode(this.polyInterface, this.address,
              _address, _devName)
          );
          logger.info('Add node worked: %s', result);
          if (result) {
            radiora2.queryOutputState(lutronId);
          }
        } catch (err) {
          logger.errorStack(err, 'Add node failed:');
        }
      } else if (_devType === 6) {
        try {
          const result = await this.polyInterface.addNode(
            new MaestroDimmerNode(this.polyInterface, this.address,
              _address, _devName)
          );
          logger.info('Add node worked: %s', result);
          if (result) {
            radiora2.queryOutputState(lutronId);
          }
        } catch (err) {
          logger.errorStack(err, 'Add node failed:');
        }
      } else {
        logger.debug('No Device Type');
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

    // lutronConnect(host, username, password) {
      // const prefix = "id";
    // lutronConnect() {

    //   // const nodes = this.polyInterface.getNodes();


    //   // let radiora2 = new RadioRa2();

    //   logger.info('Attempting Lutron Connection');

    //   // Begin Listeners
    //   // radiora2.on('messageReceived', function(data) {
    //   //   logger.info('LUTRON ' + data);
    //   // });

    //   // radiora2.on('loggedIn', function() {
    //   //   logger.info('Connected to Lutron');
    //   // });

    //   // radiora2.on('sent', function(data) {
    //   //   logger.info('Message Sent' + data);
    //   // });

    //   // radiora2.on('debug', function(data) {
    //   //   logger.info(data);
    //   // });

    //   // radiora2.on('info', function(data) {
    //   //   logger.info(data);
    //   // });

    //   // radiora2.on('warn', function(data) {
    //   //   logger.info(data);
    //   // });

    //   // radiora2.on('error', function(data) {
    //   //   logger.info(data);
    //   // });

    //   // radiora2.on('on', function(id) {
    //   //   // logger.info(id);
    //   //   let nodeAddr = this.address + 'id_' + id;
    //   //   let node = this.polyInterface.getNode(nodeAddr);
    //   //   if (node) {
    //   //     logger.info('Received for Node: ' + nodeAddr);
    //   //     node.setDriver('ST', '100');
    //   //   }

    //   // }.bind(this));

    //   // radiora2.on('off', function(id) {
    //   //   // logger.info(id);
    //   //   let nodeAddr = this.address + 'id_' + id;
    //   //   let node = this.polyInterface.getNode(nodeAddr);
    //   //   if (node) {
    //   //     logger.info('Received for Node: ' + nodeAddr);
    //   //     node.setDriver('ST', '0');
    //   //   }

    //   // }.bind(this));

    //   // radiora2.on('level', function(id, level) {
    //   //   // logger.info("ID: " + id + " Level: " + level);
    //   //   let nodeAddr = this.address + 'id_' + id;
    //   //   let node = this.polyInterface.getNode(nodeAddr);
    //   //   if (node) {
    //   //     logger.info('Received for Node: ' + nodeAddr);
    //   //     node.setDriver('ST', Math.round(level));
    //   //   }
    //   // }.bind(this));

    //   // radiora2.on('buttonPress', function(data) {
    //   //   logger.info(data);
    //   // });

    //   // radiora2.on('buttonReleased', function(data) {
    //   //   logger.info(data);
    //   // });

    //   // radiora2.on('buttonHold', function(data) {
    //   //   logger.info(data);
    //   // });

    //   // radiora2.on('keypadbuttonLEDOn', function(data) {
    //   //   logger.info(data);
    //   // });

    //   // radiora2.on('keypadbuttonLEDOff', function(data) {
    //   //   logger.info(data);
    //   // });

    //   // radiora2.on('groupOccupied', function(data) {
    //   //   logger.info(data);
    //   // });

    //   // radiora2.on('groupUnoccupied', function(data) {
    //   //   logger.info(data);
    //   // });

    //   // radiora2.on('groupUnknown', function(data) {
    //   //   logger.info(data);
    //   // });


    //   // // Receive Events from ISY Admin Console
    //   // lutronEmitter.on('query', function(id){
    //   //   radiora2.queryOutputState(id);
    //   // });

    //   // lutronEmitter.on('on', function(id) {
    //   //   logger.info('Node On Message: ' + id);
    //   //   radiora2.setSwitch(id, 100);
    //   // });

    //   // lutronEmitter.on('off', function(id) {
    //   //   logger.info('Node Off Message: ' + id);
    //   //   radiora2.setSwitch(id, 0);
    //   // });

    //   // lutronEmitter.on('level', function(id, level, fade, delay) {
    //   //   logger.info('Node Level Message: ' + id + ' Level:' + level);
    //   //   radiora2.setDimmer(id, level, fade, delay);
    //   // });

    //   // lutronEmitter.on('fdup', function(id) {
    //   //   radiora2.startRaising(id);
    //   // });

    //   // lutronEmitter.on('fddown', function(id) {
    //   //   radiora2.startLowering(id);
    //   // });

    //   // lutronEmitter.on('fdstop', function(id) {
    //   //   radiora2.stopRaiseLower(id);
    //   // });

    //   // Connect to Main Repeater
    //   // radiora2.connect(host, username, password);
    //   // return;
    // };

   
  }

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

  // radiora2.on('on', function(id) {
  //   // logger.info(id);
  //   let nodeAddr = this.address + 'id_' + id;
  //   let node = this.polyInterface.getNode(nodeAddr);
  //   if (node) {
  //     logger.info('Received for Node: ' + nodeAddr);
  //     node.setDriver('ST', '100');
  //   }
  radiora2.on('on', function(id) {
    logger.info('ID Turned On: ' + id);
    logger.info(this.polyInterface.address);
  })

  // }.bind(this));

  // radiora2.on('off', function(id) {
  //   // logger.info(id);
  //   let nodeAddr = this.address + 'id_' + id;
  //   let node = this.polyInterface.getNode(nodeAddr);
  //   if (node) {
  //     logger.info('Received for Node: ' + nodeAddr);
  //     node.setDriver('ST', '0');
  //   }

  // }.bind(this));

  // radiora2.on('level', function(id, level) {
  //   // logger.info("ID: " + id + " Level: " + level);
  //   let nodeAddr = this.address + 'id_' + id;
  //   let node = this.polyInterface.getNode(nodeAddr);
  //   if (node) {
  //     logger.info('Received for Node: ' + nodeAddr);
  //     node.setDriver('ST', Math.round(level));
  //   }
  // }.bind(this));

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
  });

  lutronEmitter.on('off', function(id) {
    logger.info('Node Off Message: ' + id);
    radiora2.setSwitch(id, 0);
  });

  lutronEmitter.on('level', function(id, level, fade, delay) {
    logger.info('Node Level Message: ' + id + ' Level:' + level);
    radiora2.setDimmer(id, level, fade, delay);
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
