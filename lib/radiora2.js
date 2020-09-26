var events = require('events');
var util = require('util');
var net = require('net');

var Lutron = function(host, username, password) {
    events.EventEmitter.call(this);
    var me = this;
    
    var readyForCommand = false;
    var loggedIn = false;
    var socket = null;
    var state = null;
    var commandQueue = [];
    var responderQueue = [];
    var onOffState = {};

    function sendUsername(prompt) {
        if (prompt != "login: ") {
            me.emit('error', "Bad initial response /" + prompt + "/");
            return;
        }
        socket.write(username+"\r\n");
        state = sendPassword;
    }

    function sendPassword(prompt) {
        if (prompt != "password: ") {
            me.emit('error', "Bad login response /" + prompt + "/");
            return;
        }
        socket.write(password+"\r\n");
        state = incomingData;
    }

    function incomingData(data) {
        var dataString = String(data), m;
        if (/^GNET>\s/.test(dataString)) {
            if (!loggedIn) {
                loggedIn = true;
                me.emit('loggedIn');
            }
            
            readyForCommand = true;
            if (commandQueue.length) {
                var msg = commandQueue.shift();
                socket.write(msg);
                me.emit('sent', msg);
            }
            return;
        }
        else {
            me.emit('debug', "Raw Data: " + dataString);
            // Split into mulitple lines
            var allData = dataString.split("\n");
            var firstCommand = allData.shift();
            var remainingCommands = allData.join("\n");
    
            //Process the first line
            var components = firstCommand.split(",");
            if (components[0] == "~OUTPUT") _processOutputResponse(components);
            if (components[0] == "~DEVICE") _processDeviceResponse(components);
            if (components[0] == "~GROUP") _processGroupResponse(components);
    
            // Any other data?
            if (remainingCommands.length > 0) {
                console.log("Repeating with additional lines...");
                incomingData(remainingCommands);
                return;
            }
        }
    }

    function _processOutputResponse(dataComponents) {
        // Level (~OUTPUT,id,1,<level>)
        if ((dataComponents.length >= 3) && (dataComponents[2] == 1)) {
            var integrationId = dataComponents[1];
            var newLevel = dataComponents[3];
            var oldLevel = onOffState[integrationId];
    
            if (newLevel == 0) {
                if (newLevel != oldLevel) {
                    me.emit('off', "Off: " + integrationId);
                }
            }
            else {
                if (newLevel != oldLevel) {
                    if (oldLevel == 0) {
                        me.emit('on', "On: " + integrationId);
                    }
                    me.emit('level', "Level: " + integrationId, newLevel);
                }
            }
    
            onOffState[integrationId] = newLevel;
        }
    }

    function _processDeviceResponse(dataComponents) {
        var deviceId = dataComponents[1];
    
        // Button Press
        if ((dataComponents.length >= 4)) {
            var action = dataComponents[3];
            var buttonId = dataComponents[2];
            // Press
            if (action == 3) {
                me.emit("buttonPress", deviceId, buttonId);
            }
            // Release
            else if (action == 4) {
                me.emit("buttonReleased", deviceId, buttonId);
            }
            else if (action == 9) {
                if (dataComponents[4] == 0) {
                    me.emit("keypadbuttonLEDOff", deviceId, buttonId);
                }
                else if (dataComponents[4] == 1) {
                    me.emit("keypadbuttonLEDOn", deviceId, buttonId);
                }
            }
            // Unknown
            else {
                me.emit('info', "Unexpected button action '" + action + "'");
            }
        }
    }

    function _processGroupResponse(dataComponents) {
        // Occupancy State (~GROUP,id,3,<state>)
        var groupId = dataComponents[1];
        var newState = dataComponents[3];
    
        // Occupied
        if (newState == 3) {
            me.emit("groupOccupied", groupId);
        }
    
        // Unoccupied
        else if (newState == 4) {
            me.emit("groupUnoccupied", groupId);
        }
    
        // Unknown
        else {
            me.emit("groupUnknown", groupId);
        }
    }

    function messageReceived(message) {
        me.emit('messageReceived', message);
    }

    this.connect = function() {
        me.emit('info', "DEBUG Host Value: " + host);
        socket = net.connect(23, host);
        socket.on('data', function(data) {
            me.emit('messageReceived', "RECEIVED >> " + String(data));
            if (~data.indexOf("login")) sendUsername(data);
            if (~data.indexOf("password")) sendPassword(data);
            if ((~data.indexOf("GNET") == 0) || (loggedIn)) incomingData(data);
        }).on('connect', function() {
        }).on('end', function() {
        }).on('close', function() {
            me.emit('close', "Connection closed!");
            setTimeout(function() {
                me.emit('close', "Attempting reconnection...");
                me.connect();
            },1000) 
        });
    }
}

util.inherits(Lutron, events.EventEmitter);
module.exports = Lutron;
