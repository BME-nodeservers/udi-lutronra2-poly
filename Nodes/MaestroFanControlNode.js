'use strict';

var eventEmitter = require('../lib/lutronEvents.js');
var lutronEmitter = eventEmitter.lutronEmitter;

// This is an example NodeServer Node definition.
// You need one per nodedefs.

// nodeDefId must match the nodedef id in your nodedef
const nodeDefId = 'MAESTRO_FAN';
let lutronId = '';

module.exports = function(Polyglot) {
// Utility function provided to facilitate logging.
  const logger = Polyglot.logger;

  // This is your custom Node class
  class MaestroFanControlNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.hint = '0x01020900'; // Example for a Dimmer switch

      this.commands = {
        DON: this.onDON,
        DOF: this.onDOF,
        GV1: this.onLow,
        GV2: this.onMed,
        GV3: this.onMedHigh,
        GV4: this.onHigh,
        QUERY: this.query,
      };

      this.drivers = {
        ST: {value: '0', uom: 51},
        GPV: {value: '12', uom: 25},
        CLIFRS: {value: '0', uom: 25},
        GV1: {value: '0', uom: 2},
        GV2: {value: '0', uom: 2},
        GV3: {value: '0', uom: 2},
        GV4: {value: '0', uom: 2},
      };

      this.lutronId = this.address.split('_')[1];
    }

    query() {
      lutronEmitter.emit('query', this.lutronId);
    }

    onDON(message) {
      // setDrivers accepts string or number (message.value is a string)
      this.setDriver('ST', message.value ? message.value : '100');

      if (!message.value) {
        lutronEmitter.emit('on', this.lutronId);
      } else {
        lutronEmitter.emit('level', this.lutronId, message.value);
      }
    }

    onDOF() {
      // logger.info('DOF (%s)', this.address);
      this.setDriver('ST', '0');
      lutronEmitter.emit('off', this.lutronId);
    }

    onLow(message) {
      this.setDriver('GV0', '1');
      this.setDriver('GV1', '1');
      this.setDriver('GV2', '0');
      this.setDriver('GV3', '0');
      this.setDriver('GV4', '0');
      lutronEmitter.emit('level', this.lutronId, 25);
    }

    onMed(message) {
      this.setDriver('GV0', '2');
      this.setDriver('GV1', '0');
      this.setDriver('GV2', '1');
      this.setDriver('GV3', '0');
      this.setDriver('GV4', '0');
      lutronEmitter.emit('level', this.lutronId, 50);
    }

    onMedHigh(message) {
      this.setDriver('GV0', '3');
      this.setDriver('GV1', '0');
      this.setDriver('GV2', '0');
      this.setDriver('GV3', '1');
      this.setDriver('GV4', '0');
      lutronEmitter.emit('level', this.lutronId, 75);
    }

    onHigh(message) {
      this.setDriver('GV0', '4');
      this.setDriver('GV1', '0');
      this.setDriver('GV2', '0');
      this.setDriver('GV3', '0');
      this.setDriver('GV4', '1');
      lutronEmitter.emit('level', this.lutronId, 100);
    }
  }

  // Required so that the interface can find this Node class using the nodeDefId
  MaestroFanControlNode.nodeDefId = nodeDefId;

  return MaestroFanControlNode;
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
