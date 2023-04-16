# NANOPAY

NanoPay is a simple and easy-to-use Node.js library for interacting with the Nano cryptocurrency network. This library allows you to perform various wallet-related tasks such as sending Nano, fetching account history, and more.


## Install

```

npm i nanopay

```

## Usage

```
// Import the module
const nano = require('nanopay');

// Set the Nano node URL
const nanoNode = 'https://nault.nanos.cc/proxy';
nano.init(nanoNode);

// Define the secret key
const secretKey = '12d2dde836172e21fcfbff2dd94c83e8ae8e53979a90e13def8f010a767e5d0c';

async function main() {
    // Convert raw value to Nano
    const convertedRaw = await nano.rawToNano(1000000000000000000000000000000);
    console.log('Converted raw value:', convertedRaw);

    // Generate an address from the secret key
    const { address, publicKey } = await nano.secretKeyDecode(secretKey);
    console.log('Address:', address);

    // Get account data (addressInfo takes an address and an optional number of recent transactions to load)
    const accountData = await nano.addressInfo(address);
    console.log('Account data:', accountData);

    // Cache PoW for the next transaction using the account's frontier
    const blockToCache = accountData.info.frontier;
    await nano.cachePOW(blockToCache);

    // Receive pending transactions
    const receivedTxn = await nano.fetchPending(secretKey);
    if (receivedTxn.hash) {
        console.log('Received transaction:', receivedTxn);
    }

    // Send Nano to an address
    const recipientAddress = 'nano_3gj8wk5r3wqonhirr81mxyhy5bumj4t3x1qopgqpsj3q3ik4p7ucg7trkx78';
    const sendAmount = 0.0001;
    const sentTxn = await nano.send(secretKey, recipientAddress, sendAmount);
    if (sentTxn.hash) {
        console.log('Sent transaction:', sentTxn);
    }

    // Send a percentage of Nano to an address
    const sendPercentage = 1;
    const sentPercentTxn = await nano.sendPercent(secretKey, recipientAddress, sendPercentage);
    if (sentPercentTxn.hash) {
        console.log('Sent percentage transaction:', sentPercentTxn);
    }
}

// Execute the main function
main();

```