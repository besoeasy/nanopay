const nanocurrency = require('nanocurrency');
const BigNumber = require('bignumber.js');
const axios = require('axios');

let NANONODE = '';

let nano_pow_cache = {};

function init(nodeurl) {
	NANONODE = nodeurl;
	nano_pow_cache = {};
}

function secretKeyDecode(secretKey) {
	var publicKey = nanocurrency.derivePublicKey(secretKey);
	var address = nanocurrency.deriveAddress(publicKey, { useNanoPrefix: true });

	return { publicKey: publicKey, address: address };
}

async function blockInfo(block) {
	return axios.post(NANONODE, { json_block: 'true', action: 'blocks_info', hashes: [block] }).then(function (response) {
		return response.data.blocks[block];
	});
}

async function addressInfo(address, count) {
	return axios
		.post(NANONODE, {
			action: 'account_history',
			account: address,
			count: count || 10,
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

async function BlocktoAmount(blockid) {
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
	const { address } = await secretKeyDecode(secretKey);
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
	const { address } = await secretKeyDecode(secretKey);
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
	const { address, publicKey } = await secretKeyDecode(secretKey);

	if ((await pendingblockcount(address)) > 0) {
		var peniong = await pendingblock(address);
		var peniongbal = await BlocktoAmount(peniong);
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

async function hybirdWork(blockblock) {
	if (nano_pow_cache[blockblock]) {
		console.log('cache found', true);

		return nano_pow_cache[blockblock];
	} else {
		console.log('cache found', false);

		var pow = await nanocurrency.computeWork(blockblock, (ComputeWorkParams = { workThreshold: 'fffffff800000000' }));
		return pow;
	}
}

async function cachePOW_cpu(blockblock) {
	console.log('cachePOW CPU', blockblock);
	var pow = await nanocurrency.computeWork(blockblock, (ComputeWorkParams = { workThreshold: 'fffffff800000000' }));
	nano_pow_cache[blockblock] = pow;
}

async function cachePOW_server(blockblock, node, user, api_key) {
	console.log('cachePOW SERVER', blockblock);

	axios.post(node, { action: 'work_generate', difficulty: 'fffffff800000000', hash: blockblock, user: user, api_key: api_key }).then(async function (response) {
		console.log('POW : Getting Work From Remote..');
		console.log(response.data);

		if (response.data.work) {
			nano_pow_cache[blockblock] = response.data.work;
		} else {
			await cachePOW_cpu(blockblock);
		}
	});
}

function rawToNano(raw) {
	var x = new BigNumber(raw);
	var xx = x.dividedBy('1000000000000000000000000000000').toFixed(20);
	return xx;
}

function nanoToRaw(nano) {
	var x = new BigNumber(nano);
	var xx = x.multipliedBy('1000000000000000000000000000000').toFixed(0);
	return xx;
}

module.exports = { init, nano_pow_cache, cachePOW_cpu, cachePOW_server, hybirdWork, fetchPending, sendPercent, send, addressInfo, blockInfo, secretKeyDecode, rawToNano, nanoToRaw };
