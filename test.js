const nano = require('./index.js');

var nanoaddress = 'nano_3gj8wk5r3wqonhirr81mxyhy5bumj4t3x1qopgqpsj3q3ik4p7ucg7trkx78';

async function main() {
	var accountData = await nano.addressInfo(nanoaddress);
	console.log(accountData);
}

main();
