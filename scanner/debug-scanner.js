'use strict'
const EventEmitter = require('events');
const fs = require('fs');
const DEVICES_FILE = "./devices";

module.exports = new EventEmitter();
module.exports.start2 = function () {
	setInterval(()=>{
		const devices = fs.readFileSync(DEVICES_FILE).toString('utf8').split('\n');
		if(devices[devices.length-1] === '') devices.pop();
		if(devices.length > 0)
			this.emit('discover', devices);
	}, 3000);
};

module.exports.start = function () {
	setInterval(()=>{
		this.emit('discover', ["disp1","disp2"]);
	}, 3000);
};
