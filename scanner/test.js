const scanner = require('./ble-scanner')

scanner.on('discover', (d) => console.log(d));
scanner.start();
