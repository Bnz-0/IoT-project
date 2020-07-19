throw new Error("Not already implemented!");

/*
const {createBluetooth} = require('node-ble');

async function startScanning(){
	const {bluetooth, destroy} = createBluetooth()
	const adapter = await bluetooth.defaultAdapter()


	if (! await adapter.isDiscovering())
		await adapter.startDiscovery()

	const device = await adapter.waitDevice('00:00:00:00:00:00')
	await device.connect()
	const gattServer = await device.gatt()

	const service1 = await gattServer.getPrimaryService('uuid')
	const characteristic1 = await service1.getCharacteristic('uuid')
	await characteristic1.writeValue(Buffer.from("Hello world"))
	const buffer = await characteristic1.readValue()
	console.log(buffer)


	await device.disconnect()
	destroy()
}

startScanning();
*/
