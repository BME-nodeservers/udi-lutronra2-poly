'use strict';

let eventEmitter = require('../lib/lutronEvents.js');
let lutronEmitter = eventEmitter.lutronEmitter;

const nodeDefId = 'VCRX';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;

  const VCRXButtonNode = require('./VCRXButtonNode.js')(Polyglot);

  class VCRXNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.hint = '0x01020900'; // Example for a Dimmer switch

      this.commands = {
        QUERY: this.query,
      };

      this.drivers = {
        ST: {value: '1', uom: 2},
        GPV: {value: '11', uom: 25},
        GV10: {value: '0', uom: 79},
        GV11: {value: '0', uom: 79},
        GV12: {value: '0', uom: 79},
        GV13: {value: '0', uom: 79},
      };

      this.lutronId = this.address.split('_')[1];
      
      // VCRX Has 6 Scene Buttons
      for (let button = 1; button <= 6; button++) {
        this._address = this.address + '_' + button;
        const result = this.polyInterface.addNode(
          new VCRXButtonNode(this.polyInterface, this.address,
            this._address, 'Scene ' + button)
        );
      }      
    }

    query() {
      lutronEmitter.emit('query', lutronId);
    }
  }

  // Required so that the interface can find this Node class using the nodeDefId
  VCRXNode.nodeDefId = nodeDefId;

  return VCRXNode;
};
