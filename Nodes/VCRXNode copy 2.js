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
        GV1: this.onScene1,
        GV2: this.onScene2,
        GV3: this.onScene3,
        GV4: this.onScene4,
        GV5: this.onScene5,
        GV6: this.onScene6,
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

    onScene1() {
      this.setDriver('GV1', 100);
      lutronEmitter.emit('buttonPress', lutronId, 1);
    }

    onScene2() {
      this.setDriver('GV2', 100);
      lutronEmitter.emit('buttonPress', lutronId, 2);
    }

    onScene3() {
      this.setDriver('GV3', 100);
      lutronEmitter.emit('buttonPress', lutronId, 3);
    }

    onScene4() {
      this.setDriver('GV4', 100);
      lutronEmitter.emit('buttonPress', lutronId, 4);
    }

    onScene5() {
      this.setDriver('GV5', 100);
      lutronEmitter.emit('buttonPress', lutronId, 5);
    }

    onScene6() {
      this.setDriver('GV6', 100);
      lutronEmitter.emit('buttonPress', lutronId, 6);
    }

  }

  // Required so that the interface can find this Node class using the nodeDefId
  VCRXNode.nodeDefId = nodeDefId;

  return VCRXNode;
};
