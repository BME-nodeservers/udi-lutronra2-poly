'use strict';

let eventEmitter = require('../lib/lutronEvents.js');
let lutronEmitter = eventEmitter.lutronEmitter;

const nodeDefId = 'W3BRL';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;

  const ButtonNode = require('./ButtonNode.js')(Polyglot);

  class W3BRLNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.commands = {
        QUERY: this.query,
      };

      this.drivers = {
        ST: {value: '1', uom: 2},
        GPV: {value: '21', uom: 25},
      };

      this.lutronId = this.address.split('_')[1];
      this.setDriver('ST', 1, true, true);
      this.setDriver('GPV', 21, true, true);

      for (let button = 2; button <= 4; button++) {
        this._address = this.address + '_' + button;
        const result = this.polyInterface.addNode(
          new ButtonNode(this.polyInterface, this.address,
            this._address, 'Scene ' + button)
        );
      }      
    }

    query() {
      // lutronEmitter.emit('query', this.lutronId);
      this.setDriver('ST', 1);
      this.setDriver('GPV', 21);
    }
  }

  // Required so that the interface can find this Node class using the nodeDefId
  W3BRLNode.nodeDefId = nodeDefId;

  return W3BRLNode;
};
