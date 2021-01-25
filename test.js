const nano = require('./index.js');

var nanoaddress = 'nano_3gj8wk5r3wqonhirr81mxyhy5bumj4t3x1qopgqpsj3q3ik4p7ucg7trkx78';

nano.init('', '');

async function main() {
	var accountData = await nano.addressInfo(nanoaddress, 3);
	console.log(accountData);
}

main();
