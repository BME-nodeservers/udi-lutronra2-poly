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
        GPV: {value: '2', uom: 25},
      };

      this.lutronId = this.address.split('_')[1];
      this.setDriver('GPV', 2, true, true);
    }

    query() {
      lutronEmitter.emit('query', this.lutronId);
    }

  }

  // Required so that the interface can find this Node class using the nodeDefId
  OccupancyNode.nodeDefId = nodeDefId;

  return OccupancyNode;
};
