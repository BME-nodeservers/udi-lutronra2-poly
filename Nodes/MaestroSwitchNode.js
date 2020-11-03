'use strict';

let eventEmitter = require('../lib/lutronEvents.js');
let lutronEmitter = eventEmitter.lutronEmitter;
let lutronId = '';

const nodeDefId = 'MAESTRO_SWITCH';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;

  class MaestroSwitchNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.hint = '0x01020900'; // Example for a Dimmer switch

      this.commands = {
        DON: this.onDON,
        DOF: this.onDOF,
        QUERY: this.query,
      };

      this.drivers = {
        ST: {value: '0', uom: 78},
        GPV: {value: '10', uom: 25},

      };

      this.lutronId = this.address.split('_')[1];
    }

    query() {
      lutronEmitter.emit('query', this.lutronId);
    }

    onDON(message) {
      // setDrivers accepts string or number (message.value is a string)
      logger.info('DON (%s)', this.address);
      this.setDriver('ST', message.value ? message.value : '100');
      lutronEmitter.emit('on', this.lutronId);
    }

    onDOF() {
      logger.info('DOF (%s)', this.address);
      this.setDriver('ST', '0');
      lutronEmitter.emit('off', this.lutronId);
    }

  }

  // Required so that the interface can find this Node class using the nodeDefId
  MaestroSwitchNode.nodeDefId = nodeDefId;

  return MaestroSwitchNode;
};
