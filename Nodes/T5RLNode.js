'use strict';

let eventEmitter = require('../lib/lutronEvents.js');
let lutronEmitter = eventEmitter.lutronEmitter;

const nodeDefId = 'T5RL';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;

  const T5RLButtonNode = require('./T5RLButtonNode.js')(Polyglot);

  class T5RLNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.commands = {
        QUERY: this.query,
      };

      this.drivers = {
        ST: {value: '1', uom: 2},
        GPV: {value: '14', uom: 25},
      };

      this.lutronId = this.address.split('_')[1];
      this.setDriver('ST', 1, true, true);
      this.setDriver('GPV', 14, true, true);

      
      let result

      // T5RL Has 7 Scene Buttons but two are buttons 16 and 17
      for (let button = 1; button <= 5; button++) {
        this._address = this.address + '_' + button;
        result = this.polyInterface.addNode(
          new T5RLButtonNode(this.polyInterface, this.address,
            this._address, 'Scene ' + button)
        );
      }      

      this._address = this.address + '_' + 16;
      result = this.polyInterface.addNode(
        new T5RLButtonNode(this.polyInterface, this.address,
          this._address, 'Scene 16')
      );

      this._address = this.address + '_' + 17;
      result = this.polyInterface.addNode(
        new T5RLButtonNode(this.polyInterface, this.address,
          this._address, 'Scene 17')
      );

    }

    query() {
      // lutronEmitter.emit('query', this.lutronId);
      this.setDriver('ST', 1);
      this.setDriver('GPV', 14);
    }
  }

  // Required so that the interface can find this Node class using the nodeDefId
  T5RLNode.nodeDefId = nodeDefId;

  return T5RLNode;
};
