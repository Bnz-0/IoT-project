'use strict'
const EventEmitter = require('events');
const noble = require('noble');

/* uuid of the emitter service */
const service_uuid = "aa5462a4f1124ce88e15830096af8e12";

module.exports = new EventEmitter();
module.exports.start = function() {
	noble.on('stateChange', function(state) {
		if (state === 'poweredOn')
			noble.startScanning(service_uuid);
		else
			noble.stopScanning();
	});

	noble.on('discover', (peripheral) => {
		console.log("discovered", peripheral.address);
		const serviceData = peripheral.advertisement.serviceData;
		if (serviceData && serviceData.length > 0)
			this.emit('discover', serviceData[0].data.toString());
	});
}
