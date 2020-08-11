'use strict'
const EventEmitter = require('events');
const prompt = require('prompt-sync')();


module.exports = new EventEmitter();
module.exports.start = function () {
	while(1) {
		const device = prompt('device to emit: ');
		if(!device) break;
		this.emit('discover', device);
	}
};
