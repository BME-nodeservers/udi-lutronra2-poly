'use strict';

let eventEmitter = require('../lib/lutronEvents.js');
let lutronEmitter = eventEmitter.lutronEmitter;
let lutronId = '';

const nodeDefId = 'VCRX';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;

  class VCRXNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.hint = '0x01020900'; // Example for a Dimmer switch

      this.commands = {
        // DON: this.onDON,
        // DOF: this.onDOF,
        QUERY: this.query,
      };

      this.drivers = {
        ST: {value: '1', uom: 2},
        GPV: {value: '11', uom: 25},
        GV1: {value: '0', uom: 78},
        GV2: {value: '0', uom: 78},
        GV3: {value: '0', uom: 78},
        GV4: {value: '0', uom: 78},
        GV5: {value: '0', uom: 78},
        GV6: {value: '0', uom: 78},
        GV10: {value: '0', uom: 79},
        GV11: {value: '0', uom: 79},
        GV12: {value: '0', uom: 79},
        GV13: {value: '0', uom: 79},
      };

      lutronId = this.address.split('_')[1];
    }

    query() {
      lutronEmitter.emit('query', lutronId);
    }

    onDON(message) {
      // setDrivers accepts string or number (message.value is a string)
      logger.info('DON (%s)', this.address);
      this.setDriver('ST', message.value ? message.value : '1');
      lutronEmitter.emit('on', lutronId);
    }

    onDOF() {
      logger.info('DOF (%s)', this.address);
      this.setDriver('ST', '0');
      lutronEmitter.emit('off', lutronId);
    }

  }

  // Required so that the interface can find this Node class using the nodeDefId
  VCRXNode.nodeDefId = nodeDefId;

  return VCRXNode;
};
