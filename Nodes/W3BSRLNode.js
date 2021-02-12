'use strict';

let eventEmitter = require('../lib/lutronEvents.js');
let lutronEmitter = eventEmitter.lutronEmitter;

const nodeDefId = 'W3BSRL';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;

  const ButtonNode = require('./ButtonNode.js')(Polyglot);

  class W3BSRLNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.commands = {
        QUERY: this.query,
      };

      this.drivers = {
        ST: {value: '1', uom: 2},
        GPV: {value: '22', uom: 25},
      };

      this.lutronId = this.address.split('_')[1];
      this.setDriver('ST', 1, true, true);
      this.setDriver('GPV', 22, true, true);
      
      this._address1 = this.address + '_' + '1';
      this.polyInterface.addNode(new ButtonNode(this.polyInterface, this.address1, this._address, 'Scene ' + '1'));

      this._address3 = this.address + '_' + '3';
      this.polyInterface.addNode(new ButtonNode(this.polyInterface, this.address3, this._address, 'Scene ' + '3'));

      this._address5 = this.address + '_' + '5';
      this.polyInterface.addNode(new ButtonNode(this.polyInterface, this.address5, this._address, 'Scene ' + '5'));
    }

    query() {
      // lutronEmitter.emit('query', this.lutronId);
      this.setDriver('ST', 1);
      this.setDriver('GPV', 22);
    }
  }

  // Required so that the interface can find this Node class using the nodeDefId
  W3BSRLNode.nodeDefId = nodeDefId;

  return W3BSRLNode;
};
