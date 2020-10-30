'use strict';

const RadioRa2 = require('../lib/radiora2');
let radiora2 = new RadioRa2();
let lutronEvents = require('../lib/lutronEvents.js');
let lutronEmitter = lutronEvents.lutronEmitter;

let reconnect = 300000;

const nodeDefId = 'MAINREPEATER';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;
  const MaestroDimmerNode = require('./MaestroDimmerNode.js')(Polyglot);
  const MaestroSwitchNode = require('./MaestroSwitchNode.js')(Polyglot);
  const MaestroFanControlNode = require('./MaestroFanControlNode.js')(Polyglot);
  const OccupancyNode = require('./OccupancyNode.js')(Polyglot);
  const RoomStatusNode = require('./RoomStatusNode.js')(Polyglot);
  const Pico2BNode = require('./Pico2BNode.js')(Polyglot);
  const Pico2BRLNode = require('./Pico2BRLNode.js')(Polyglot);
  const Pico3BRLNode = require('./Pico3BRLNode.js')(Polyglot);
  const Pico4BNode = require('./Pico4BNode.js')(Polyglot);
  const VCRXNode = require('./VCRXNode.js')(Polyglot);
  const T5RLNode = require('./T5RLNode.js')(Polyglot);
  const T10RLNode = require('./T10RLNode.js')(Polyglot);
  const T15RLNode = require('./T15RLNode.js')(Polyglot);


  class MainRepeaterNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.commands = {
        PBUTTON: this.onPhantom,
        // DISCOVER: this.onDiscover,
        // UPDATE_PROFILE: this.onUpdateProfile,
        // REMOVE_NOTICES: this.onRemoveNotices,
        QUERY: this.query,
      };

      this.drivers = {
        ST: { value: '1', uom: 2 }, // uom 2 = Boolean. '1' is True.
        GPV: {value: '1', uom: 25},
        GV0: {value: '0', uom: 0 },
      };

      this.listenerAlive = false;
      this.connected = false;

      // this.isController = true;
      // this.listenerSetup();
      // this.repeaterSetup();
      // this.getDevices();
      this.startMainRepeater();
    }

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    startMainRepeater() {
      const _config = this.polyInterface.getConfig();
      const config = Object(_config.typedCustomData);

        if (config.ipAddress) {
          if (this.listenerAlive) {
            logger.info('RadioRA2 Listener Alive');
          } else {
            this.listenerSetup();
          }

          if (this.connected) {
            logger.info('Main Repeater already connected');  
          } else {
            this.repeaterSetup();
          }
        }
      }

    repeaterSetup() {
      logger.info('Begin Main Repeater Setup...');

      const _config = this.polyInterface.getConfig();
      const config = Object(_config.typedCustomData);

      if (config.ipAddress) {
        let _host = config.ipAddress;
        let _username = config.username;
        let _password = config.password;
        if (config.reconnect) {
          reconnect = config.reconnect;
        }
        
        logger.info('Host: ' + _host);
        logger.info('Username: ' + _username);
        logger.info('Password: ' + _password);
  
        try {
          radiora2.connect(_host, _username, _password);
          setTimeout(function() {
            logger.info('Getting Devices');
            try {
              this.getDevices();
            } catch (err) {
              logger.errorStack(err, 'Get Devices Failed');
            }
          }.bind(this), 1000);
          this.connected = true;
        } catch (err) {
          logger.errorStack(err, 'Connection to Main Repeater Failed');
        }
      }
      
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
      // const prefix = '_';
      // let _address = this.address + prefix + intId;
      // lutronId = this.address.split('_')[1];
      // let _address = this.address + '_' + intId;
      let _address = this.address.split('_')[0] + '_' + intId;
      let _lutronId = intId;
      let _devName = devName;
      let _devType = devType;

      switch(_devType) {
        case 1: // Main Repeater
          break;
        case 2: // Occupancy
          try {
            const result = await this.polyInterface.addNode(
              new OccupancyNode(this.polyInterface, _address,
                _address, _devName)
            );
            if (result) {
              logger.info('Add node worked: %s', result);
            }
          } catch (err) {
            logger.errorStack(err, 'Add node failed:');
          }
          break;
        case 3: // Room Status
          try {
            const result = await this.polyInterface.addNode(
              new RoomStatusNode(this.polyInterface, _address,
                _address, _devName)
            );
            if (result) {
              logger.info('Add node worked: %s', result);
            }
          } catch (err) {
            logger.errorStack(err, 'Add node failed:');
          }
          break;
        case 4: // 2B Pico
          try {
            const result = await this.polyInterface.addNode(
              new Pico2BNode(this.polyInterface, _address,
                _address, _devName)
            );
            logger.info('Add node worked: %s', result);
          } catch (err) {
            logger.errorStack(err, 'Add node failed:');
          }
          break;
        case 5: // 2BRL Pico
        try {
          const result = await this.polyInterface.addNode(
            new Pico2BRLNode(this.polyInterface, _address,
              _address, _devName)
          );
          logger.info('Add node worked: %s', result);
        } catch (err) {
          logger.errorStack(err, 'Add node failed:');
        }
          break;
        case 6: // 3B Pico
        try {
          const result = await this.polyInterface.addNode(
            new Pico3BNode(this.polyInterface, _address,
              _address, _devName)
          );
          logger.info('Add node worked: %s', result);
        } catch (err) {
          logger.errorStack(err, 'Add node failed:');
        }
          break;
        case 7: // 3BRL Pico
          try {
            const result = await this.polyInterface.addNode(
              new Pico3BRLNode(this.polyInterface, _address,
                _address, _devName)
            );
            logger.info('Add node worked: %s', result);
          } catch (err) {
            logger.errorStack(err, 'Add node failed:');
          }
          break;
        case 8: // 4B Pico
          try {
            const result = await this.polyInterface.addNode(
              new Pico4BNode(this.polyInterface, _address,
                _address, _devName)
            );
            logger.info('Add node worked: %s', result);
          } catch (err) {
            logger.errorStack(err, 'Add node failed:');
          }
          break;
        case 9:
          //code
          break;
        case 10: // Switch
            try {
              const result = await this.polyInterface.addNode(
                new MaestroSwitchNode(this.polyInterface, _address,
                  _address, _devName)
              );
              if (result) {
                logger.info('Add node worked: %s', result);
                // await this.sleep(1000);
                // radiora2.queryOutputState(_lutronId);
              }
            } catch (err) {
              logger.errorStack(err, 'Add node failed:');
            }
          break;
        case 11: // Dimmer
          try {
            const result = await this.polyInterface.addNode(
              new MaestroDimmerNode(this.polyInterface, _address,
                _address, _devName)
            );
            if (result) {
              logger.info('Add node worked: %s', result);
              // await this.sleep(1000);
              // radiora2.queryOutputState(_lutronId);
            }
          } catch (err) {
            logger.errorStack(err, 'Add node failed:');
          }
          break;
        case 12: // Fan Controller
          try {
            const result = await this.polyInterface.addNode(
              new MaestroFanControlNode(this.polyInterface, _address,
                _address, _devName)
            );
            if (result) {
              logger.info('Add node worked: %s', result);
              // await this.sleep(1000);
              // radiora2.queryOutputState(_lutronId);
            }
          } catch (err) {
            logger.errorStack(err, 'Add node failed:');
          }
          break;
        case 13: // VCRX
          try {
            const result = await this.polyInterface.addNode(
              new VCRXNode(this.polyInterface, _address,
                _address, _devName)
            );
            if (result) {
              logger.info('Add node worked: %s', result);
            }
          } catch (err) {
            logger.errorStack(err, 'Add node failed:');
          }
        break;
        case 14: // T5RL
          try {
            const result = await this.polyInterface.addNode(
              new T5RLNode(this.polyInterface, _address,
                _address, _devName)
            );
            if (result) {
              logger.info('Add node worked: %s', result);
            }
          } catch (err) {
            logger.errorStack(err, 'Add node failed:');
          }
          break;
        case 15: // T10RL
          try {
            const result = await this.polyInterface.addNode(
              new T10RLNode(this.polyInterface, _address,
                _address, _devName)
            );
            if (result) {
              logger.info('Add node worked: %s', result);
            }
          } catch (err) {
            logger.errorStack(err, 'Add node failed:');
          }
          break;
        case 16: // T15RL
          try {
            const result = await this.polyInterface.addNode(
              new T15RLNode(this.polyInterface, _address,
                _address, _devName)
            );
            if (result) {
              logger.info('Add node worked: %s', result);
            }
          } catch (err) {
            logger.errorStack(err, 'Add node failed:');
          }
          break;
        default:
          logger.info('No Device Type Defined');
          break;
      }
    }

    onPhantom(button) {
      this.setDriver('GV0', button.value);
      radiora2.pressButton('1', button.value);
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

    listenerSetup() {
      radiora2.on('messageReceived', function(data) {
        logger.info('LUTRON ' + data);
      }.bind(this));

      radiora2.on('loggedIn', function() {
        logger.info('Connected to Lutron');
      }.bind(this));

      radiora2.on('sent', function(data) {
        logger.info('Message Sent' + data);
      }.bind(this));

      radiora2.on('debug', function(data) {
        logger.info(data);
      }.bind(this));

      radiora2.on('info', function(data) {
        logger.info(data);
      }.bind(this));

      radiora2.on('warn', function(data) {
        logger.info(data);
      }.bind(this));

      radiora2.on('error', function(data) {
        logger.info(data);
      }.bind(this));

      radiora2.on('close', function(data) {
        logger.info(data);
        setTimeout(function() {
          logger.info('Restarting NodeServer...');
          try {
            this.polyInterface.restart();
          } catch (err) {
            logger.errorStack(err, 'Connection to Polyglot Failed');
          }
        }.bind(this), reconnect);
      }.bind(this));

      radiora2.on('on', function(id) {
        // let nodeAddr = this.address + '_' + id;
        let nodeAddr = this.address.split('_')[0] + '_' + id;
        let node = this.polyInterface.getNode(nodeAddr);
        if (node) {
          logger.info('Received for Node: ' + nodeAddr);
          node.setDriver('ST', '100');
        }
      }.bind(this));

      radiora2.on('off', function(id) {
        // logger.info(id);
        // let nodeAddr = this.address + '_' + id;
        let nodeAddr = this.address.split('_')[0] + '_' + id;
        let node = this.polyInterface.getNode(nodeAddr);
        if (node) {
          logger.info('Received for Node: ' + nodeAddr);
          node.setDriver('ST', '0');
        }

      }.bind(this));

      radiora2.on('level', function(id, level) {
        logger.info('ID: ' + id + ' Level: ' + level);
        let nodeAddr = this.address.split('_')[0] + '_' + id;
        logger.info('Address: ' + nodeAddr);
        let node = this.polyInterface.getNode(nodeAddr);
        logger.info(node);
        if (node) {
          let newLevel = Math.round(level);
          logger.info('Rounded Level: ' + newLevel);
          logger.info('Received for Node: ' + nodeAddr);
          node.setDriver('ST', newLevel);

          let fanIndex = node.getDriver('CLIFRS');
          if (fanIndex) {
            let fanSpeed = node.getDriver('ST');
            let currentValue = parseInt(fanSpeed['value'], 10);
            logger.info('Fan Speed %: ' + currentValue);

            if (currentValue > 1 && currentValue <= 25) {
              node.setDriver('CLIFRS', '1');
              logger.info('Fan Speed: Low');
            } else if (currentValue >= 26 && currentValue <= 51) {
              node.setDriver('CLIFRS', '2');
              logger.info('Fan Speed: Medium');
            } else if (currentValue >= 56 && currentValue <= 76) {
              node.setDriver('CLIFRS', '3');
              logger.info('Fan Speed: Med High');
            } else if (currentValue > 76) {
              node.setDriver('CLIFRS', '4');
              logger.info('Fan Speed: High');
            } else {
              node.setDriver('CLIFRS', '0');
              logger.info('Fan Speed: Off');
            }
          } else {
            logger.info(id + ': Not a fan controller');
          }
        }
      }.bind(this));

      radiora2.on('buttonPress', function(id, buttonId) {
        logger.info(id + ': Button ' + buttonId + ' Pressed');

        // let nodeAddr = this.address + '_' + id;
        let nodeAddr = this.address.split('_')[0] + '_' + id;
        logger.info('Address: ' + nodeAddr);
        let node = this.polyInterface.getNode(nodeAddr);
        // logger.info(node);
        if (node) {
          let _gpv = node.getDriver('GPV');
          let devType = _gpv['value'];
          logger.info('DevType: ' + devType);
          let _gv = 'GV' + buttonId;

          switch(devType) {
            case '2': // Occupancy
              node.setDriver('ST', 1);
              break;
            case '4': // 2B Pico
              break;
            case '5': // 2BRL Pico
              break;
            case '6': // 3B Pico
            case '7': // 3BRL Pico
              node.setDriver(_gv, 1);
            case '13': // VCRX
              switch(buttonId) {
                case '30':
                  node.setDriver('GV10', 100);
                  break;
                case '31':
                  node.setDriver('GV11', 100);
                  break;
                case '32':
                  node.setDriver('GV12', 100);
                  break;
                case '33':
                  node.setDriver('GV13', 100);
                  break;
                default:
                  break;
              }
            default:
              break;
          }
        }
        
      }.bind(this));

      radiora2.on('buttonReleased', function(id, buttonId) {
        logger.info(id + ': Button Released');

        // let nodeAddr = this.address + '_' + id;
        let nodeAddr = this.address.split('_')[0] + '_' + id;
        logger.info('Address: ' + nodeAddr);
        let node = this.polyInterface.getNode(nodeAddr);
        logger.info(node);
        if (node) {
          let _gpv = node.getDriver('GPV');
          let devType = _gpv['value'];
          logger.info('DevType: ' + devType);
          let _gv = 'GV' + buttonId;

          switch(devType) {
            case '2': // Occupancy
              node.setDriver('ST', 0);
              break;
            case '4': // 2B Pico
              break;
            case '5': // 2BRL Pico
              break;
            case '6': // 3B Pico
              break;
            case '7': // 3BRL Pico
              node.setDriver(_gv, 0);
            case '13': // VCRX
              switch(buttonId) {
                case '30':
                  node.setDriver('GV10', 0);
                  break;
                case '31':
                  node.setDriver('GV11', 0);
                  break;
                case '32':
                  node.setDriver('GV12', 0);
                  break;
                case '33':
                  node.setDriver('GV13', 0);
                  break;
                default:
                  break;
              }
            default:
              break;
          }
        }
        
      }.bind(this));

      radiora2.on('buttonHold', function(data) {
        logger.info(data);
      }.bind(this));

      radiora2.on('keypadbuttonLEDOn', function(deviceId, buttonId) {
        logger.info(deviceId + ': KeyPad Button: ' + buttonId + ' LED On');
        let nodeAddr = null;
        let myNodeAddr = this.address.split('_')[0] + '_' + deviceId;
        let node = null;

        switch(buttonId) {
          case '81':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_1';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '82':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_2';
            node = this.polyInterface.getNode(nodeAddr);            
            break;
          case '83':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_3';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '84':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_4';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '85':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_5';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '86':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_6';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '87':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_7';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '88':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_8';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '89':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_9';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '90':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_10';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '91':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_11';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '92':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_12';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '93':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_13';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '94':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_14';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '95':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_15';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          default:
            break;
        }
        if (node) {
          node.setDriver('ST', 1);
        }
      }.bind(this));

      radiora2.on('keypadbuttonLEDOff', function(deviceId, buttonId) {
        logger.info(deviceId + ': KeyPad Button: ' + buttonId +' LED Off');
        let nodeAddr = null;
        let node = null;

        switch(buttonId) {
          case '81':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_1';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '82':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_2';
            node = this.polyInterface.getNode(nodeAddr);            
            break;
          case '83':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_3';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '84':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_4';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '85':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_5';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '86':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_6';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '87':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_7';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '88':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_8';
            node = this.polyInterface.getNode(nodeAddr);            
            break;
          case '89':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_9';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '90':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_10';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '91':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_11';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '92':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_12';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '93':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_13';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '94':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_14';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          case '95':
            nodeAddr = this.address.split('_')[0] + '_' + deviceId + '_15';
            node = this.polyInterface.getNode(nodeAddr);
            break;
          default:
            break;
        }
        if (node) {
          node.setDriver('ST', 0);
        }
      }.bind(this));

      radiora2.on('groupOccupied', function(groupId) {
        logger.info('Group Id: ' + groupId + ' Occupied')
        let nodeAddr = this.address + '_' + groupId;
        let node = this.polyInterface.getNode(nodeAddr);
        if (node) {
          node.setDriver('ST', '1');
        }
      }.bind(this));

      radiora2.on('groupUnoccupied', function(groupId) {
        logger.info('Group Id: ' + groupId + ' Unoccupied')
        // let nodeAddr = this.address + '_' + groupId;
        let nodeAddr = this.address.split('_')[0] + '_' + groupId;
        let node = this.polyInterface.getNode(nodeAddr);
        if (node) {
          node.setDriver('ST', '2');
        }
      }.bind(this));

      radiora2.on('groupUnknown', function(groupId) {
        logger.info('Group Id: ' + groupId + ' Unknown')
        // let nodeAddr = this.address + '_' + groupId;
        let nodeAddr = this.address.split('_')[0] + '_' + groupId;
        let node = this.polyInterface.getNode(nodeAddr);
        if (node) {
          node.setDriver('ST', '0');
        }
      }.bind(this));

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

      lutronEmitter.on('buttonPress', function(deviceId, buttonId) {
        radiora2.pressButton(deviceId, buttonId);
      })

      lutronEmitter.on('queryDeviceButton', function(deviceId, buttonId) {
        radiora2.queryDeviceButtonState(deviceId, buttonId);
      })

      lutronEmitter.on('queryGroupState', function(deviceId) {
        radiora2.queryGroupState(deviceId);
      })
      

      this.listenerAlive = true;
      return;
    };

  }  

  // Required so that the interface can find this Node class using the nodeDefId
  MainRepeaterNode.nodeDefId = nodeDefId;

  return MainRepeaterNode;
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
