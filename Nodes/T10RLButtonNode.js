'use strict';

let eventEmitter = require('../lib/lutronEvents.js');
let lutronEmitter = eventEmitter.lutronEmitter;

const nodeDefId = 'T10RLBUTTON';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;

  class T10RLButtonNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.hint = '0x01020900'; // Example for a Dimmer switch

      this.commands = {
        DON: this.onDON,
        QUERY: this.query(),
      };

      this.drivers = {
        ST: {value: '1', uom: 2},
        GPV: {value: '15', uom: 25},
      };

      this.lutronId = this.address.split('_')[1];
      this.buttonId = this.address.split('_')[2];
    }

    query() {

      switch(this.buttonId) {
        case '1':
          lutronEmitter.emit('queryDeviceButton', this.lutronId, 81);
          break;
        case '2':
          lutronEmitter.emit('queryDeviceButton', this.lutronId, 82);
          break;
        case '3':
          lutronEmitter.emit('queryDeviceButton', this.lutronId, 83);
          break;
        case '4':
          lutronEmitter.emit('queryDeviceButton', this.lutronId, 84);
          break;
        case '5':
          lutronEmitter.emit('queryDeviceButton', this.lutronId, 85);
          break;
        case '6':
          lutronEmitter.emit('queryDeviceButton', this.lutronId, 86);
          break;
        case '7':
          lutronEmitter.emit('queryDeviceButton', this.lutronId, 87);
          break;
        case '8':
          lutronEmitter.emit('queryDeviceButton', this.lutronId, 88);
          break;
        case '9':
          lutronEmitter.emit('queryDeviceButton', this.lutronId, 89);
          break;
        case '10':
          lutronEmitter.emit('queryDeviceButton', this.lutronId, 90);
          break;
        case '11':
          this.setDriver('ST', 0);
          break;
        case '12':
          this.setDriver('ST', 0);
          break;
        default:
          break;
      }
    }

    onDON() {
      this.setDriver('ST', 1);
      lutronEmitter.emit('buttonPress', this.lutronId, this.buttonId);
    }
  }

  // Required so that the interface can find this Node class using the nodeDefId
  T10RLButtonNode.nodeDefId = nodeDefId;

  return T10RLButtonNode;
};
