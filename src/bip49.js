const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')
const assert = require('assert')

function getAddress(root, type, index) {
  const path = `m/49'/0'/0'/${type}/${index}`
  const child = root.derivePath(path)
  const keyhash = bitcoin.crypto.hash160(child.getPublicKeyBuffer())
  const scriptSig = bitcoin.script.witnessPubKeyHash.output.encode(keyhash)
  const addressBytes = bitcoin.crypto.hash160(scriptSig)
  const outputScript = bitcoin.script.scriptHash.output.encode(addressBytes)
  const address = bitcoin.address.fromOutputScript(outputScript, bitcoin.networks.bitcoin)
  return address
}

function getAddresses(type, mnemonic, number) {
  var seed = bip39.mnemonicToSeed(mnemonic)
  var root = bitcoin.HDNode.fromSeedBuffer(seed)
  const addresses = []
  for (let i = 0; i < number; i++) {
    addresses.push(getAddress(root, type, i))
  }
  return addresses
}

function getReceivingAddresses(mnemonic, number) {
  return getAddresses(0, mnemonic, number)
}

function getChangeAddresses(mnemonic, number) {
  return getAddresses(1, mnemonic, number)
}

function test() {
  const mnemonic = 'soap actual until edit table blue pioneer section pluck dolphin soon wrap'
  assert(getReceivingAddresses(mnemonic, 1)[0] === '3GwGTSWsEs4dmkHKfRfCzgHvR8pfDuwUxp')
  assert(getChangeAddresses(mnemonic, 1)[0] === '3237idHUr6RjSTnZtkP27JhjgcJghdNqkY')
}

exports.generateMnemonic = function () {
  // Generate a random mnemonic (uses crypto.randomBytes under the hood), defaults to 128-bits of entropy
  return bip39.generateMnemonic(160)
}

exports.printAddresses = function (mnemonic) {
  if (mnemonic.split(' ').length < 12) {
    throw new Error()
  }
  console.log('Receiving addresses:')
  getReceivingAddresses(mnemonic, 10).forEach((address) => console.log(address))
  console.log('Change addresses:')
  getChangeAddresses(mnemonic, 5).forEach((address) => console.log(address))
}

test()
