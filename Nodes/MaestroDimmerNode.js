'use strict';

var eventEmitter = require('../lib/lutronEvents.js');
var lutronEmitter = eventEmitter.lutronEmitter;

// This is an example NodeServer Node definition.
// You need one per nodedefs.

// nodeDefId must match the nodedef id in your nodedef
const nodeDefId = 'MAESTRO_DIMMER';
var lutronId = '';

module.exports = function(Polyglot) {
// Utility function provided to facilitate logging.
  const logger = Polyglot.logger;

  // This is your custom Node class
  class MaestroDimmerNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);     

      this.hint = '0x01020900'; // Example for a Dimmer switch
      
      this.commands = {
        DON: this.onDON,
        DOF: this.onDOF,

        // You can use the query function from the base class directly
        QUERY: this.query,
      };

      this.drivers = {
        ST: {value: '0', uom: 51},
      };
      
      var id = this.address.split("_");
      logger.info("Split ID: " + id);
      lutronId = id[1];
    }

    onDON(message) {
      // logger.info('DON (%s): %s',
      //   this.address,
      //   message.value ? message.value : 'No value');

      // setDrivers accepts string or number (message.value is a string)
      this.setDriver('ST', message.value ? message.value : '100');
      
      if (!message.value) {
        // lutronEmitter.emit('on', this.address + " " + "100");
        lutronEmitter.emit('on', lutronId);
      }
      else {
        logger.info("Logger with Leve: " + this.address + " " + message.value);
        lutronEmitter.emit('level', this.address + " " + message.value);
      }
      
      
        // this.address + ":" + message.value ? message.value : '100');
    }

    onDOF() {
      logger.info('DOF (%s)', this.address);
      this.setDriver('ST', '0');
      lutronEmitter.emit('off', lutronId);
    }
    
  };

  // Required so that the interface can find this Node class using the nodeDefId
  MaestroDimmerNode.nodeDefId = nodeDefId;

  return MaestroDimmerNode;
};


// Those are the standard properties of every nodes:
// this.id              - Nodedef ID
// this.polyInterface   - Polyglot interface
// this.primary         - Primary address
// this.address         - Node address
// this.name            - Node name
// this.timeAdded       - Time added (Date() object)
// this.enabled         - Node is enabled?
// this.added           - Node is addeto ISY?
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
