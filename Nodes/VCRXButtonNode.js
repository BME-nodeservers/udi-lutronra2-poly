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
        QUERY: this.query(),
      };

      this.drivers = {
        ST: {value: '1', uom: 2},
        GPV: {value: '11', uom: 25},
      };

      this.lutronId = this.address.split('_')[1];
      this.buttonId = this.address.split('_')[2];

      this.query();
      setTimeout(function() {
        try {
          this.query();
        } catch (err) {
          logger.errorStack(err, 'Query Failed');
        }
      }.bind(this), 1500);
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
          myButtonId = 85;
          break;
        case '6':
          myButtonId = 86;
          break;
        default:
          break;
      }
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
