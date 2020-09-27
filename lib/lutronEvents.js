const EventEmitter = require('events');

var obj = new EventEmitter();

module.exports = obj;

setInterval(function() {
    obj.emit('someEvent', "blah blah blah ===============");
}, 10 * 1000);