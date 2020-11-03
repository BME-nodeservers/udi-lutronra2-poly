var events = require('events');
var util = require('util');
var net = require('net');

var Lutron = function() {

  events.EventEmitter.call(this);
  var me = this;

  var readyForCommand = false;
  var loggedIn = false;
  var socket = null;
  var state = null;
  var commandQueue = [];
  var responderQueue = [];
  var onOffState = {};

  function sendUsername(prompt, username) {
    try {
      socket.write(username + '\r\n');
      state = sendPassword;
    } catch (err) {
      me.emit('error', 'Bad login response: ' + prompt);
    }
  }

  function sendPassword(prompt, password) {
    try {
      socket.write(password + '\r\n');
      state = incomingData;
    } catch (err) {
      me.emit('error', 'Bad password reponse: ' + prompt);
    }
  }

  function incomingData(data) {
    let dataString = String(data);

    if (!loggedIn) {
      loggedIn = true;
      me.emit('loggedIn');
    }

    readyForCommand = true;
    if (commandQueue.length) {
      let msg = commandQueue.shift();
      socket.write(msg);
      me.emit('sent', msg);
    }

    // Split into mulitple lines
    let allData = dataString.split('\n');
    let firstCommand = allData.shift();
    let remainingCommands = allData.join('\n');

    // Process the first line
    let components = firstCommand.split(',');
    if (components[0] == '~OUTPUT') _processOutputResponse(components);
    if (components[0] == '~DEVICE') _processDeviceResponse(components);
    if (components[0] == '~GROUP') _processGroupResponse(components);

    // Any other data?
    if (remainingCommands.length > 0) {
      me.emit('info', 'Repeating with additional lines...');
      incomingData(remainingCommands);
    }
  }

  function _processOutputResponse(dataComponents) {
    // Level (~OUTPUT,id,1,<level>)
    // me.emit('debug', 'Components: ' + dataComponents);
    if ((dataComponents.length >= 3) && (dataComponents[2] == 1)) {
      var integrationId = dataComponents[1];
      var newLevel = dataComponents[3];
      var oldLevel = onOffState[integrationId];
      // me.emit('debug', 'Old Level: ' + oldLevel);
      // me.emit('debug', 'New Level: ' + newLevel);
      me.emit('level', integrationId, newLevel);
      onOffState[integrationId] = newLevel;
    }
  }

  function _processDeviceResponse(dataComponents) {
    // ~DEVICE,6,2,4
    var deviceId = dataComponents[1];

    // Button Press
    if ((dataComponents.length >= 4)) {
      var action = dataComponents[3];
      var buttonId = dataComponents[2];
      
      if (action == 3) { // Press
        me.emit('buttonPress', deviceId, buttonId);
      } else if (action == 4) { // Release
        me.emit('buttonReleased', deviceId, buttonId);
      } else if (action == 9) {
        if (dataComponents[4] == 0) {
          me.emit('keypadbuttonLEDOff', deviceId, buttonId);
        } else if (dataComponents[4] == 1) {
          me.emit('keypadbuttonLEDOn', deviceId, buttonId);
        } else if (dataComponents[4] == 255) {
          me.emit('keypadbuttonLEDOff', deviceId, buttonId);
        }
      } else {
        me.emit('info', "Unexpected button action '" + action + "'");
      }
    }
  }

  function _processGroupResponse(dataComponents) {
    // Occupancy State (~GROUP,id,3,<state>)
    var groupId = dataComponents[1];
    var newState = dataComponents[3];

    if (newState == 3) { // Occupied
      me.emit('groupOccupied', groupId);
    } else if (newState == 4) { // Unoccupied
      me.emit('groupUnoccupied', groupId);
    } else { // Unknown
      me.emit('groupUnknown', groupId);
    }
  }

  function messageReceived(message) {
    me.emit('messageReceived', message);
  }

  this.sendCommand = function(command) {
    if (!/\r\n$/.test(command)) {
      command += '\r\n';
    }
    if (readyForCommand) {
      readyForCommand = false;
      // me.emit('debug', command);
      socket.write(command);
    } else {
      // me.emit('debug', 'readyForCommand: ' + readyForCommand);
      commandQueue.push(command);
    }
  };

  this.setDimmer = function(id, level, fade, delay, cb) {
    let cmd = '#OUTPUT,' + id + ',1,' + level;
    if (fade) {
      cmd += ',' + fade;
    } else {
      cmd += ',' + 0;
    }

    if (delay) {
      cmd += ',' + delay;
    } else {
      cmd += ',' + 0;
    }

    me.sendCommand(cmd);
  };

  this.setSwitch = function(id, on) {
    me.setDimmer(id, on ? 100 : 0);
  };

  this.startRaising = function(id) {
    let cmd = '#OUTPUT,' + id + ',2,';
    me.sendCommand(cmd);
  };

  this.startLowering = function(id) {
    let cmd = '#OUTPUT,' + id + ',3,';
    me.sendCommand(cmd);
  };

  this.stopRaiseLower = function(id) {
    let cmd = '#OUTPUT,' + id + ',4,';
    me.sendCommand(cmd);
  };

  this.queryOutput = function(id, cb) {
    var result;
    result = function(msg) {
      if (msg.type == 'status' && id == msg.id) {
        if (cb) {
          cb(msg);
        }
        me.removeListener('messageReceived', result);
      }
    };
    me.on('messageReceived', result);
    me.sendCommand('?OUTPUT,' + id + ',1');
  };

  this.pressButton = function(id, btn) {
    me.sendCommand('#DEVICE,' + id + ',' + btn + ',3');
    me.sendCommand('#DEVICE,' + id + ',' + btn + ',4');
  };

  this.queryDeviceButtonState = function(id, btn) {
    me.sendCommand('?DEVICE,' + id + ',' + btn + ',9');
  };

  this.queryGroupState = function(groupId) {
    me.sendCommand('?GROUP,' + groupId + ',3');
  };

  this.queryOutputState = function(deviceId) {
    me.sendCommand('?OUTPUT,' + deviceId + ',1');
  };

  this.connect = function(host, username, password) {
    let LOGIN = new RegExp(/login: /gm);
    let PASSWD = new RegExp(/password: /gm);
    let GNET = new RegExp(/^\wNET> /gm);

    socket = net.connect(23, host);
    socket.on('data', function(data) {
      if (LOGIN.test(data)) {
        sendUsername(data, username);
      }
      if (PASSWD.test(data)) {
        sendPassword(data, password);
      }
      if (GNET.test(data) || loggedIn) {
        incomingData(data);
      }
    }).on('connect', function() {
    }).on('end', function() {
      me.emit('end', 'Connection ended!');
    }).on('close', function() {
      me.emit('close', 'Connection closed!');
    });
  };
};

util.inherits(Lutron, events.EventEmitter);
module.exports = Lutron;
