//throw new Error("Not already implemented!");

// https://www.npmjs.com/package/node-ble#step-4b-subscribe-to-a-characteristic
const {createBluetooth} = require('node-ble');
const {bluetooth, destroy} = createBluetooth();

const interval = 10_000;

function handleReject(action) {
	return (err) =>	console.error(`An error occurred while ${action}: (${err.name}) ${err.message}`);
}

bluetooth.defaultAdapter().then(
	async adapter => {
		try {
			if (! await adapter.isDiscovering())
				await adapter.startDiscovery();
		}
		catch (err) {
			handleReject('check/start discovery')(err);
			return;
		}

		async function routine() {
			let devices;
			try {
				devices = await adapter.devices(); //TODO: it doesn't "delete" unreachable devices...
				console.log('devices',devices);
			} catch(err) {
				handleReject('getting the device IDs')(err);
				return;
			}

			for(let device_id of devices) adapter.waitDevice(device_id).then(
				async device => {
					let gattServer;
					try {
						await device.connect();
						gattServer = await device.gatt();
					} catch(err) {
						handleReject('connecting to device '+device_id)(err);
						return;
					}
					const services = await gattServer.services();
					console.log('services of '+device_id, services);

					for(let service_id of services) {
						if(service_id === "aa5462a4-f112-4ce8-8e15-830096af8e12" || true) { //TODO: the uuid is different: 00001801-0000-1000-8000-00805f9b34fb
							try{
								const service = await gattServer.getPrimaryService(service_id);
								const characteristics = await service.characteristics();
								for(let char_id of characteristics){
									const characteristic = await service.getCharacteristic(char_id);
									const buffer = await characteristic.readValue(); // (DBusError) Read not permitted
									console.log('BUFFER:',buffer);
								}
							} catch(err) {
								handleReject('reading the characteristic')(err);
							}
						}
					}
					device.disconnect();
				},
				handleReject('waiting for the device '+device_id)
			);
		}

		setInterval(routine, interval);
	}, handleReject('getting the default adapter')
);

//TODO export