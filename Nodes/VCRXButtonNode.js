'use strict';

let eventEmitter = require('../lib/lutronEvents.js');
let lutronEmitter = eventEmitter.lutronEmitter;

const nodeDefId = 'VCRXBUTTON';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;

  class VCRXButtonNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.hint = '0x01020900'; // Example for a Dimmer switch

      this.commands = {
        DON: this.onDON,
        // GV1: this.onScene1,
        // GV2: this.onScene2,
        // GV3: this.onScene3,
        // GV4: this.onScene4,
        // GV5: this.onScene5,
        // GV6: this.onScene6,
        QUERY: this.query(),
      };

      this.drivers = {
        ST: {value: '1', uom: 2},
        GPV: {value: '11', uom: 25},
        // GV1: {value: '0', uom: 78},
        // GV2: {value: '0', uom: 78},
        // GV3: {value: '0', uom: 78},
        // GV4: {value: '0', uom: 78},
        // GV5: {value: '0', uom: 78},
        // GV6: {value: '0', uom: 78},
        // GV10: {value: '0', uom: 79},
        // GV11: {value: '0', uom: 79},
        // GV12: {value: '0', uom: 79},
        // GV13: {value: '0', uom: 79},
      };

      this.lutronId = this.address.split('_')[1];
      this.buttonId = this.address.split('_')[2];
    }

    query() {
      let myButtonId = null;

      switch(this.buttonId) {
        case '1':
          myButtonId = 81;
          break;
        case '2':
          myButtonId = 82;
          break;
        case '3':
          myButtonId = 83;
          break;
        case '4':
          myButtonId = 84;
          break;
        case '5':
          myButtonId = 86;
          break;
        case '6':
          myButtonId = 86;
          break;
        default:
          break;
      }
      logger.info('============ ID: ' + this.lutronId + ' ' + 'Button: ' + myButtonId);
      lutronEmitter.emit('queryDeviceButton', this.lutronId, myButtonId);
    }

    onDON() {
      this.setDriver('ST', 1);
      lutronEmitter.emit('buttonPress', lutronId, this.buttonId);
    }

  }

  // Required so that the interface can find this Node class using the nodeDefId
  VCRXButtonNode.nodeDefId = nodeDefId;

  return VCRXButtonNode;
};
