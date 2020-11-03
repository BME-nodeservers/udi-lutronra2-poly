'use strict';

var eventEmitter = require('../lib/lutronEvents.js');
var lutronEmitter = eventEmitter.lutronEmitter;

// This is an example NodeServer Node definition.
// You need one per nodedefs.

// nodeDefId must match the nodedef id in your nodedef
const nodeDefId = 'MAESTRO_DIMMER';
let lutronId = '';

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
        BRT: this.onBRT,
        DIM: this.onDIM,
        FDUP: this.onFDUP,
        FDDOWN: this.onFDDOWN,
        FDSTOP: this.onFDSTOP,
        RR: this.onRampRate,
        DELAY: this.onDelay,
        QUERY: this.query,
      };

      this.drivers = {
        ST: {value: '0', uom: 51},
        GPV: {value: '11', uom: 25},
        RR: {value: '0', uom: 58},
        DELAY: {value: '0', uom: 58},
      };

      this.lutronId = this.address.split('_')[1];
    }

    query() {
      lutronEmitter.emit('query', this.lutronId);
    }

    onDON(message) {
      // setDrivers accepts string or number (message.value is a string)
      this.setDriver('ST', message.value ? message.value : '100');

      let rampRateST = this.getDriver('RR');
      let delayST = this.getDriver('DELAY');
      let rampRate = parseFloat(rampRateST['value']);
      let delayRate = parseFloat(delayST['value']);

      if (!message.value) {
        lutronEmitter.emit('on', this.lutronId);
      } else {
        lutronEmitter.emit('level', this.lutronId, message.value,
            rampRate, delayRate);
      }
    }

    onDOF() {
      // logger.info('DOF (%s)', this.address);
      this.setDriver('ST', '0');
      lutronEmitter.emit('off', this.lutronId);
    }

    onBRT() {
      let driverST = this.getDriver('ST');
      let currentValue = parseInt(driverST['value'], 10);
      let brightIncrease = currentValue + 10;
      if (brightIncrease >= 100) {
        lutronEmitter.emit('level', this.lutronId, 100);
      } else {
        lutronEmitter.emit('level', this.lutronId, brightIncrease);
      }
    }

    onDIM() {
      let driverST = this.getDriver('ST');
      let currentValue = parseInt(driverST['value'], 10);
      let dimValue = currentValue - 10;
      if (dimValue <= 0) {
        lutronEmitter.emit('level', this.lutronId, 0);
      } else {
        lutronEmitter.emit('level', this.lutronId, dimValue);
      }
    }

    onFDUP() {
      lutronEmitter.emit('fdup', this.lutronId);
    }

    onFDDOWN() {
      lutronEmitter.emit('fddown', this.lutronId);
    }

    onFDSTOP() {
      lutronEmitter.emit('fdstop', this.lutronId);
    }

    onRampRate(message) {
      this.setDriver('RR', message.value);
    }

    onDelay(message) {
      this.setDriver('DELAY', message.value);
    }
  }

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
