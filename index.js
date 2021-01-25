const nanocurrency = require('nanocurrency');
const BigNumber = require('bignumber.js');
const axios = require('axios');

let NANONODE = '';
let WORKNODE = '';

function init(var1, var2) {
	NANONODE = var1 || 'https://mynano.ninja/api/node';
	WORKNODE = var2;
}

async function gensecretKey(seed, index) {
	return nanocurrency.deriveSecretKey(seed, parseInt(index));
}

async function secretKeytoaddr(secretKey) {
	var publicKey = await nanocurrency.derivePublicKey(secretKey);
	var address = await nanocurrency.deriveAddress(publicKey, { useNanoPrefix: true });
	return address;
}

async function blockInfo(block) {
	return axios.post(NANONODE, { action: 'blocks_info', hashes: [block] }).then(function (response) {
		reply.json(response.data);
	});
}

async function addressInfo(address, count) {
	return axios
		.post(NANONODE, {
			action: 'account_history',
			account: address,
			count: count || 100,
		})
		.then(function (response) {
			return axios
				.post(NANONODE, {
					action: 'account_info',
					account: address,
				})
				.then(function (response2) {
					return axios
						.post(NANONODE, {
							action: 'pending',
							account: address,
						})
						.then(function (response3) {
							return {
								address: address,
								info: response2.data,
								pendingblocks: response3.data.blocks,
								history: response.data.history,
							};
						});
				});
		});
}

async function publish(blockjson) {
	return axios
		.post(NANONODE, {
			action: 'process',
			json_block: 'true',
			block: blockjson,
		})
		.then(function (response) {
			return response.data;
		})
		.catch(function (error) {
			console.log(error);
		});
}

async function accountdig(account) {
	return axios
		.post(NANONODE, {
			account: account,
			action: 'account_info',
		})
		.then(function (response) {
			return response.data;
		})
		.catch(function (error) {
			console.log(error);
		});
}

async function pendingblock(account) {
	return axios
		.post(NANONODE, {
			account: account,
			action: 'pending',
		})
		.then(function (response) {
			return response.data.blocks[0];
		})
		.catch(function (error) {
			console.log(error);
		});
}

async function pendingblockcount(account) {
	return axios
		.post(NANONODE, {
			account: account,
			action: 'pending',
		})
		.then(function (response) {
			x = response.data.blocks;

			return x.length;
		})
		.catch(function (error) {
			console.log(error);
		});
}

async function block_info(blockid) {
	return axios
		.post(NANONODE, {
			hashes: [blockid],
			json_block: 'true',
			action: 'blocks_info',
			pending: 'true',
		})
		.then(function (response) {
			return response.data.blocks[blockid].amount;
		})
		.catch(function (error) {
			console.log(error);
		});
}

async function send(secretKey, sendto, amount) {
	var address = await secretKeytoaddr(secretKey);
	var sddsf_address = await accountdig(address);
	var cbal = sddsf_address.balance;
	var previous = sddsf_address.frontier;
	var pow = await hybirdWork(previous);

	var x = new BigNumber('1000000000000000000000000000000');
	var xx = x.multipliedBy(amount).toFixed();
	var puki = new BigNumber(cbal);
	var balance = puki.minus(xx);

	var balancex = balance.toFixed(0);

	if (balancex >= 0) {
		dd = {
			balance: balancex,
			link: sendto,
			previous: previous,
			representative: address,
			work: pow,
		};
		var xxx = await nanocurrency.createBlock(secretKey, dd);
		var retr = await publish(xxx.block);
	} else {
		var retr = { error: 'no_balance' };
	}

	return retr;
}

async function sendPercent(secretKey, sendto, per) {
	var address = await secretKeytoaddr(secretKey);
	var percentage = (100 - per) / 100;

	var sddsf_address = await accountdig(address);
	var cbal = sddsf_address.balance;
	var previous = sddsf_address.frontier;
	var pow = await hybirdWork(previous);

	var puki = new BigNumber(cbal);
	var balance = puki.multipliedBy(percentage);
	var balancex = balance.toFixed(0);

	if (balancex >= 0) {
		dd = {
			balance: balancex,
			link: sendto,
			previous: previous,
			representative: address,
			work: pow,
		};
		var xxx = await nanocurrency.createBlock(secretKey, dd);
		var retr = await publish(xxx.block);
	} else {
		var retr = { error: 'no_balance' };
	}

	return retr;
}

async function fetchPending(secretKey) {
	var address = await secretKeytoaddr(secretKey);

	if ((await pendingblockcount(address)) > 0) {
		var peniong = await pendingblock(address);
		var peniongbal = await block_info(peniong);
		var sddsf_address = await accountdig(address);

		if (sddsf_address.error) {
			var cbal = '0';
			var previous = null;
			var pow = await hybirdWork(publicKey);
		} else {
			var cbal = sddsf_address.balance;
			var previous = sddsf_address.frontier;
			var pow = await hybirdWork(previous);
		}

		var puki = new BigNumber(cbal);
		var balance = puki.plus(peniongbal);
		var balancex = balance.toFixed();

		dd = {
			balance: balancex,
			link: peniong,
			previous: previous,
			representative: address,
			work: pow,
		};

		var xxx = await nanocurrency.createBlock(secretKey, dd);
		var retr = await publish(xxx.block);

		return retr;
	} else {
		return '{ "hash" : 0 }';
	}
}

async function recentBlockcache(secretKey) {
	var address = await secretKeytoaddr(secretKey);

	var sddsf_address = await accountdig(address);

	if (sddsf_address.error) {
		var cbal = '0';
		var previous = null;
		var pow = await hybirdWork(publicKey);
		var xx = publicKey;
	} else {
		var cbal = sddsf_address.balance;
		var previous = sddsf_address.frontier;
		var pow = await hybirdWork(previous);
		var xx = previous;
	}

	return xx;
}

async function hybirdWork(blockblock) {
	return axios
		.post(WORKNODE, { action: 'work_generate', difficulty: 'fffffff800000000', hash: blockblock })
		.then(function (response) {
			console.log('gpu work : ' + response.data.work);
			return response.data.work;
		})
		.catch(async function (error) {
			pow = await nanocurrency.computeWork(blockblock, (ComputeWorkParams = { workThreshold: 'fffffff800000000' }));
			console.log('cpu work : ' + pow);
			return pow;
		});
}

module.exports = { init, hybirdWork, recentBlockcache, fetchPending, sendPercent, send, addressInfo, blockInfo, gensecretKey, secretKeytoaddr };
