const nanocurrency = require('nanocurrency');
const BigNumber = require('bignumber.js');
const axios = require('axios');

const WORK_THRESHOLD = 'fffffff800000000';
const NANO_CONVERSION_FACTOR = new BigNumber('1000000000000000000000000000000');
const nanoPowCache = new Map();

let NANONODE = '';

function init(nodeurl) {
	NANONODE = nodeurl;
}

async function postToNanoNode(data) {
	try {
		const response = await axios.post(NANONODE, data);
		return response.data;
	} catch (error) {
		console.error(error);
		return null;
	}
}

function secretKeyDecode(secretKey) {
	const publicKey = nanocurrency.derivePublicKey(secretKey);
	const address = nanocurrency.deriveAddress(publicKey, { useNanoPrefix: true });

	return { publicKey, address };
}

async function blockInfo(block) {
	const data = { json_block: 'true', action: 'blocks_info', hashes: [block] };
	return postToNanoNode(data).then((response) => response.blocks[block]);
}

async function addressInfo(address, count = 10) {
	const accountHistoryData = { action: 'account_history', account: address, count };
	const accountInfoData = { action: 'account_info', account: address };
	const pendingData = { action: 'pending', account: address };

	const [historyResponse, infoResponse, pendingResponse] = await Promise.all([postToNanoNode(accountHistoryData), postToNanoNode(accountInfoData), postToNanoNode(pendingData)]);

	return {
		address,
		info: infoResponse,
		pendingblocks: pendingResponse.blocks,
		history: historyResponse.history,
	};
}

async function publish(blockjson) {
	const data = { action: 'process', json_block: 'true', block: blockjson };
	return postToNanoNode(data);
}

async function accountdig(account) {
	const data = { account, action: 'account_info' };
	return postToNanoNode(data);
}

async function pendingblock(account) {
	const data = { account, action: 'pending' };
	return postToNanoNode(data).then((response) => response.blocks[0]);
}

async function pendingblockcount(account) {
	const data = { account, action: 'pending' };
	return postToNanoNode(data).then((response) => response.blocks.length);
}

async function BlocktoAmount(blockid) {
	const data = { hashes: [blockid], json_block: 'true', action: 'blocks_info', pending: 'true' };
	return postToNanoNode(data).then((response) => response.blocks[blockid].amount);
}

async function send(secretKey, sendTo, amount) {
	const { address } = await secretKeyDecode(secretKey);
	const accountInfo = await accountdig(address);
	const currentBalance = new BigNumber(accountInfo.balance);
	const previous = accountInfo.frontier;
	const pow = await hybridWork(previous);

	const amountToSend = new BigNumber(amount).multipliedBy('1000000000000000000000000000000');
	const newBalance = currentBalance.minus(amountToSend);

	if (newBalance.isGreaterThanOrEqualTo(0)) {
		const blockData = {
			balance: newBalance.toFixed(0),
			link: sendTo,
			previous,
			representative: address,
			work: pow,
		};
		const createdBlock = await nanocurrency.createBlock(secretKey, blockData);
		return publish(createdBlock.block);
	} else {
		return { error: 'no_balance' };
	}
}

async function sendPercent(secretKey, sendTo, percent) {
	const { address } = await secretKeyDecode(secretKey);
	const accountInfo = await accountdig(address);
	const currentBalance = new BigNumber(accountInfo.balance);
	const previous = accountInfo.frontier;
	const pow = await hybridWork(previous);

	const newBalance = currentBalance.multipliedBy(1 - percent / 100);
	if (newBalance.isGreaterThanOrEqualTo(0)) {
		const blockData = {
			balance: newBalance.toFixed(0),
			link: sendTo,
			previous,
			representative: address,
			work: pow,
		};
		const createdBlock = await nanocurrency.createBlock(secretKey, blockData);
		return publish(createdBlock.block);
	} else {
		return { error: 'no_balance' };
	}
}

async function fetchPending(secretKey) {
	const { address, publicKey } = await secretKeyDecode(secretKey);

	const pendingBlockCount = await pendingblockcount(address);
	if (pendingBlockCount > 0) {
		const pendingBlock = await pendingblock(address);
		const pendingBlockBalance = await BlocktoAmount(pendingBlock);
		const accountInfo = await accountdig(address);

		const currentBalance = accountInfo.error ? new BigNumber(0) : new BigNumber(accountInfo.balance);
		const previous = accountInfo.error ? null : accountInfo.frontier;
		const pow = await hybridWork(previous || publicKey);

		const newBalance = currentBalance.plus(pendingBlockBalance);

		const blockData = {
			balance: newBalance.toFixed(),
			link: pendingBlock,
			previous,
			representative: address,
			work: pow,
		};

		const createdBlock = await nanocurrency.createBlock(secretKey, blockData);
		return publish(createdBlock.block);
	} else {
		return { hash: 0 };
	}
}

function setNanoPowCache(block, pow) {
	nanoPowCache.set(block, pow);
}

function clearNanoPowCache() {
	nanoPowCache.clear();
}

async function hybridWork(block) {
	if (nanoPowCache.has(block)) {
		console.log('Cache found', true);
		return nanoPowCache.get(block);
	} else {
		console.log('Cache found', false);
		const pow = await nanocurrency.computeWork(block, { workThreshold: WORK_THRESHOLD });
		return pow;
	}
}

async function cachePOW(input) {
	if (nanocurrency.checkAddress(input)) {
		try {
			const accountInfo = await accountdig(input);
			const frontier = accountInfo.frontier;
			if (frontier) {
				await cachePOW(frontier);
				console.log('Cached PoW for account frontier:', frontier);
			} else {
				console.log('No frontier found for account:', input);
			}
		} catch (error) {
			console.error('Error caching PoW for account:', error);
		}
	} else {
		console.log('cachePOW CPU', input);
		if (!nanoPowCache.has(input)) {
			const pow = await nanocurrency.computeWork(input, { workThreshold: WORK_THRESHOLD });
			nanoPowCache.set(input, pow);
		}
		return nanoPowCache.get(input);
	}
}

function rawToNano(raw) {
	return new BigNumber(raw).dividedBy(NANO_CONVERSION_FACTOR).toFixed(20);
}

function nanoToRaw(nano) {
	return new BigNumber(nano).multipliedBy(NANO_CONVERSION_FACTOR).toFixed(0);
}

module.exports = { init, cachePOW, hybridWork, fetchPending, sendPercent, send, addressInfo, blockInfo, secretKeyDecode, rawToNano, nanoToRaw, setNanoPowCache, clearNanoPowCache };
