//const scanner = import './ble-scanner';
const scanner = require('./debug-scanner');
const room = process.argv[2];

if(!room){
	console.error("You must provide a room");
	process.exit(1);
}

let old_devices = [];

function discover(devices) {
	const insert = [], remove = [];
	
    for(let device of old_devices)
		if(!devices.includes(device))
			remove.push(device);

	if(remove.length > 0){
		console.log("DELETE", remove);
		//TODO: send to db
	}

	for(let device of devices)
		if(!old_devices.includes(device))
			insert.push(device);

	if(insert.length > 0){
		console.log("INSERT", insert);
		//TODO: send to db
	}

	old_devices = devices;
}

scanner.start();
scanner.on('discover', discover);

console.log("scanner for",room,"started!");
