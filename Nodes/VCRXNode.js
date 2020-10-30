'use strict';

let eventEmitter = require('../lib/lutronEvents.js');
let lutronEmitter = eventEmitter.lutronEmitter;

const nodeDefId = 'VCRX';
const prefix = 'id_';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;

  const VCRXButtonNode = require('./VCRXButtonNode.js')(Polyglot);

  class VCRXNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.hint = '0x01020900'; // Example for a Dimmer switch

      this.commands = {
        // GV1: this.onScene1,
        // GV2: this.onScene2,
        // GV3: this.onScene3,
        // GV4: this.onScene4,
        // GV5: this.onScene5,
        // GV6: this.onScene6,
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

    // onScene1() {
    //   this.setDriver('GV1', 100);
    //   lutronEmitter.emit('buttonPress', lutronId, 1);
    // }

    // onScene2() {
    //   this.setDriver('GV2', 100);
    //   lutronEmitter.emit('buttonPress', lutronId, 2);
    // }

    // onScene3() {
    //   this.setDriver('GV3', 100);
    //   lutronEmitter.emit('buttonPress', lutronId, 3);
    // }

    // onScene4() {
    //   this.setDriver('GV4', 100);
    //   lutronEmitter.emit('buttonPress', lutronId, 4);
    // }

    // onScene5() {
    //   this.setDriver('GV5', 100);
    //   lutronEmitter.emit('buttonPress', lutronId, 5);
    // }

    // onScene6() {
    //   this.setDriver('GV6', 100);
    //   lutronEmitter.emit('buttonPress', lutronId, 6);
    // }

  }

  // Required so that the interface can find this Node class using the nodeDefId
  VCRXNode.nodeDefId = nodeDefId;

  return VCRXNode;
};
