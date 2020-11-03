'use strict';

let eventEmitter = require('../lib/lutronEvents.js');
let lutronEmitter = eventEmitter.lutronEmitter;
let lutronId = '';

const nodeDefId = 'ROOMSTATUS';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;

  class RoomStatusNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.hint = '0x01020900'; // Example for a Dimmer switch

      this.commands = {
        QUERY: this.query,
      };

      this.drivers = {
        ST: {value: '2', uom: 25},
        GPV: {value: '3', uom: 25},
      };

      this.lutronId = this.address.split('_')[1];
    }

    query() {
      lutronEmitter.emit('queryGroupState', this.lutronId);
    }

  }

  // Required so that the interface can find this Node class using the nodeDefId
  RoomStatusNode.nodeDefId = nodeDefId;

  return RoomStatusNode;
};
