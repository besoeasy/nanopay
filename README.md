# nanopay

```javascript
const nano = require('nanopay');

//init package with custom nodes
nano.init('nano node url', 'work solver');

// init nano with defaults
nano.init('', '');

var seed = '12d2dde836172e21fcfbff2dd94c83e8ae8e53979a90e13def8f010a767e5d0c';
var nanoaddress = 'nano_3gj8wk5r3wqonhirr81mxyhy5bumj4t3x1qopgqpsj3q3ik4p7ucg7trkx78';
var amount = 0.0000001;

async function main() {
	var secrateKey = await nano.gensecretKey(seed, 0);
	var genaddress = await nano.secretKeytoaddr(secrateKey);
	console.log('My address : ' + genaddress);

	var accountData = await nano.addressInfo(genaddress);
	console.log(accountData);

	var done1 = await nano.fetchPending(secrateKey);

	if (done1.hash) {
		console.log('fetched : ' + done.hash);
	}

	var done2 = await nano.send(secrateKey, nanoaddress, amount);

	if (done2.hash) {
		console.log('sent : ' + done.hash);
	}
}

main();
```
