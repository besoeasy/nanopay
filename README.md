# nanopay

```javascript
//load module
const nano = require('nanopay');

// init nano.init( nanonode, worknode)
nano.init('https://mynano.ninja/api/node', 'https://besoeasy.com/api/nanopow');

var seed = '12d2dde836172e21fcfbff2dd94c83e8ae8e53979a90e13def8f010a767e5d0c';
var nanoaddress = 'nano_3gj8wk5r3wqonhirr81mxyhy5bumj4t3x1qopgqpsj3q3ik4p7ucg7trkx78';
var amount = 0.0000001;

async function main() {
            // generate privatekey from seed and path 
            // nano.gensecretKey(seed, index)
	var secrateKey = await nano.gensecretKey(seed, 0);

            //generate address from secretKey
	var genaddress = await nano.secretKeytoaddr(secrateKey);

	console.log('My address : ' + genaddress);


            //get account data addressInfo(address, number of recent transactions to load [optional] )
	var accountData = await nano.addressInfo(genaddress);
	console.log(accountData);

           //recieve pending transactions
	var done1 = await nano.fetchPending(secrateKey);

	if (done1.hash) {
		console.log('fetched : ' + done1);
	}

          // send nano to address
	var done2 = await nano.send(secrateKey, nanoaddress, amount);

	if (done2.hash) {
		console.log('sent : ' + done2);
	}
}

main();
```


## Pow Work

https://besoeasy.com/api/nanopow
