'use strict';

let eventEmitter = require('../lib/lutronEvents.js');
let lutronEmitter = eventEmitter.lutronEmitter;
let util = require('../lib/utils.js');

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
        GPV: {value: '13', uom: 25},
        GV10: {value: '100', uom: 79},
        GV11: {value: '100', uom: 79},
        GV12: {value: '100', uom: 79},
        GV13: {value: '100', uom: 79},
      };

      this.lutronId = this.address.split('_')[1];
      
      // VCRX Has 6 Scene Buttons
      for (let button = 1; button <= 6; button++) {
        this._address = this.address + '_' + button;

        setTimeout(function() {
          logger.info('Create VCRX LED Button: ' + button);
          try {
            const result = this.polyInterface.addNode(
              new VCRXButtonNode(this.polyInterface, this.address,
                this._address, 'Scene ' + button)
            );
            if (result) {
              this.buttonQuery(button);
            }
          } catch (err) {
            logger.errorStack(err, 'Create VCRX LED ' + button + ' Failed');
          }
        }.bind(this), 2000);
      }      
    }

    query() {
      lutronEmitter.emit('query', this.lutronId);
    }

    async buttonQuery(button) {
      let buttonLED = null;

      switch(button) {
        case 1:
          buttonLED = 81;
          break;
        case 2:
          buttonLED = 82;
          break;
        case 3:
          buttonLED = 83;
          break;
        case 4:
          buttonLED = 84;
          break;
        case 5:
          buttonLED = 85;
          break;
        case 6:
          buttonLED = 86;
          break;
        default:
          break;
      }

      await util.sleep(2000);
      lutronEmitter.emit('queryDeviceButton', this.lutronId, buttonLED)
    }
  }

  // Required so that the interface can find this Node class using the nodeDefId
  VCRXNode.nodeDefId = nodeDefId;

  return VCRXNode;
};
