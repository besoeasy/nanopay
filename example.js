//load module
const nano = require('./index');

const nanoNode = 'https://nault.nanos.cc/proxy';

nano.init(nanoNode);

var secrateKey = '12d2dde836172e21fcfbff2dd94c83e8ae8e53979a90e13def8f010a767e5d0c';

async function main() {
	const datas = await nano.rawToNano(1000000000000000000000000000000);
	console.log(datas);

	//generate address from secretKey
	const { address, publicKey } = await nano.secretKeyDecode(secrateKey);

	console.log('Address : ' + address);

	//get account data addressInfo(address, number of recent transactions to load [optional] )
	var accountData = await nano.addressInfo(address);
	console.log(accountData);

	//cache pow for next txn
	var blockTOcache = accountData.info.frontier;

	// BLOCK, NODE, USER, APIKEY
	await nano.cachePOW_gpu(blockTOcache, nanoNode, 'user', 'apikey');

	// BLOCK
	await nano.cachePOW_cpu(blockTOcache);

	//recieve pending transactions
	var done1 = await nano.fetchPending(secrateKey);

	if (done1.hash) {
		console.log('fetched : ' + done1);
	}

	// send nano to address
	var done2 = await nano.send(secrateKey, 'nano_3gj8wk5r3wqonhirr81mxyhy5bumj4t3x1qopgqpsj3q3ik4p7ucg7trkx78', 0.0001);

	if (done2.hash) {
		console.log('sent : ' + done2);
	}

	// send nano (Percentage) to address
	var done3 = await nano.sendPercent(secrateKey, 'nano_3gj8wk5r3wqonhirr81mxyhy5bumj4t3x1qopgqpsj3q3ik4p7ucg7trkx78', 1);

	if (done3.hash) {
		console.log('sent : ' + done3);
	}
}

main();
