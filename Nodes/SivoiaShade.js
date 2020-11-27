'use strict';

var eventEmitter = require('../lib/lutronEvents.js');
var lutronEmitter = eventEmitter.lutronEmitter;

// This is an example NodeServer Node definition.
// You need one per nodedefs.

// nodeDefId must match the nodedef id in your nodedef
const nodeDefId = 'SIVOIA_SHADE';
let lutronId = '';

module.exports = function(Polyglot) {
// Utility function provided to facilitate logging.
  const logger = Polyglot.logger;

  // This is your custom Node class
  class SivoiaShadeNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.hint = '0x01020900'; // Example for a Dimmer switch

      this.commands = {
        DON: this.onDON,
        DOF: this.onDOF,
        FDUP: this.onFDUP,
        FDDOWN: this.onFDDOWN,
        FDSTOP: this.onFDSTOP,
        QUERY: this.query,
      };

      this.drivers = {
        ST: {value: '0', uom: 51},
        GPV: {value: '30', uom: 25},
        GV0: {value: '0', uom: 79},
      };

      this.setDriver('ST', 0);
      this.setDriver('ST', 100);

      this.lutronId = this.address.split('_')[1];
    }

    query() {
      lutronEmitter.emit('query', this.lutronId);
    }

    onDON(message) {
      this.setDriver('ST', message.value ? message.value : '100');
      this.setDriver('GV0', '0'); // ISY 0 = Open

      if (!message.value) {
        lutronEmitter.emit('on', this.lutronId);
      } else {
        lutronEmitter.emit('level', this.lutronId, message.value);
      }
    }

    onDOF() {
      this.setDriver('ST', '0');
      this.setDriver('GV0', '100'); // ISY 100 = Closed
      lutronEmitter.emit('off', this.lutronId);
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

  }

  // Required so that the interface can find this Node class using the nodeDefId
  SivoiaShadeNode.nodeDefId = nodeDefId;

  return SivoiaShadeNode;
};
