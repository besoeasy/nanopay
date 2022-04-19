```javascript
//load module
const nano = require('nanopay');

// init nano.init( nanonode, worknode data)
nano.init('https://mynano.ninja/api/node', { node: '', user: '', api_key: '' });


var secrateKey = '12d2dde836172e21fcfbff2dd94c83e8ae8e53979a90e13def8f010a767e5d0c';
var nanoaddress = 'nano_3gj8wk5r3wqonhirr81mxyhy5bumj4t3x1qopgqpsj3q3ik4p7ucg7trkx78';

async function main() {
	//generate address from secretKey
	var genaddress = await nano.secretKeytoAddress(secrateKey);

	console.log('My address : ' + genaddress);

	//get account data addressInfo(address, number of recent transactions to load [optional] )
	var accountData = await nano.addressInfo(genaddress);
	console.log(accountData);

	//cache pow for next txn
	await nano.cachePOW(secrateKey);

	//recieve pending transactions
	var done1 = await nano.fetchPending(secrateKey);

	if (done1.hash) {
		console.log('fetched : ' + done1);
	}

	// send nano to address
	var done2 = await nano.send(secrateKey, nanoaddress, 0.0001);

	if (done2.hash) {
		console.log('sent : ' + done2);
	}

	// send nano (Percentage) to address
	var done3 = await nano.sendPercent(secrateKey, nanoaddress, 1);

	if (done3.hash) {
		console.log('sent : ' + done3);
	}
}

main();
```
