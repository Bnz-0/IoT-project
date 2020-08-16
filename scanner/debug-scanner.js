'use strict'
const EventEmitter = require('events');
const prompt = require('prompt-sync')();


module.exports = new EventEmitter();
module.exports.start = async function () {
	while(1) {
		await sleep(2000);
		const device = prompt('device to emit: ');
		if(!device) break;
		this.emit('discover', device);
	}
};


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
