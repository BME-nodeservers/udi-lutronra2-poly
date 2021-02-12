'use strict';

let eventEmitter = require('../lib/lutronEvents.js');
let lutronEmitter = eventEmitter.lutronEmitter;

const nodeDefId = 'W5BRLIR';

module.exports = function(Polyglot) {
  const logger = Polyglot.logger;

  const ButtonNode = require('./ButtonNode.js')(Polyglot);

  class W5BRLIRNode extends Polyglot.Node {
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      this.commands = {
        QUERY: this.query,
      };

      this.drivers = {
        ST: {value: '1', uom: 2},
        GPV: {value: '25', uom: 25},
      };

      this.lutronId = this.address.split('_')[1];
      this.setDriver('ST', 1, true, true);
      this.setDriver('GPV', 25, true, true);

      
      // 1RLD Has 5 Scene Buttons
      for (let button = 1; button <= 5; button++) {
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
      this.setDriver('GPV', 25);
    }
  }

  // Required so that the interface can find this Node class using the nodeDefId
  W5BRLIRNode.nodeDefId = nodeDefId;

  return W5BRLIRNode;
};
