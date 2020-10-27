'use strict';

let eventEmitter = require('../lib/lutronEvents.js');
let lutronEmitter = eventEmitter.lutronEmitter;
let lutronId = '';

const nodeDefId = 'OCCUPANCY';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;

  class OccupancyNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.hint = '0x01020900'; // Example for a Dimmer switch

      this.commands = {
        // DON: this.onDON,
        // DOF: this.onDOF,
        QUERY: this.query,
      };

      this.drivers = {
        ST: {value: '0', uom: 2},
        // GV0: {value: '0', uom: 25},
        // GV1: {value: '0', uom: 25},
      };

      lutronId = this.address.split('_')[1];
    }

    query() {
      lutronEmitter.emit('query', lutronId);
    }

    // onDON(message) {
    //   // setDrivers accepts string or number (message.value is a string)
    //   logger.info('DON (%s)', this.address);
    //   this.setDriver('ST', message.value ? message.value : '100');
    //   lutronEmitter.emit('on', lutronId);
    // }

    // onDOF() {
    //   logger.info('DOF (%s)', this.address);
    //   this.setDriver('ST', '0');
    //   lutronEmitter.emit('off', lutronId);
    // }

  }

  // Required so that the interface can find this Node class using the nodeDefId
  OccupancyNode.nodeDefId = nodeDefId;

  return OccupancyNode;
};
