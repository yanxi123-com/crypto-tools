var wif = require('wif')
var bitcoin = require('bitcoinjs-lib')
var BigInteger = require('bigi')
var baddress = require('bitcoinjs-lib/src/address')
var ecurve = require('ecurve')
var secp256k1 = ecurve.getCurveByName('secp256k1')
var assert = require('assert')

function hexPrivateKeyToAddress() {
  // 私钥 Buffer: 32 bytes, 256 bits, 2^256 = 2^8^32 = 2^4^64
  var privateKeyBuffer = new Buffer('737cc48dda5ca17eca0ab4b8d69b0344caa53a8aed39c3dd71e600283a372be3', 'hex')
  var compressed = true

  // 转化成 base58 私钥
  var privateKey = wif.encode(130, privateKeyBuffer, compressed) // version, privateKey, compressed
  console.log(`privateKey = ${privateKey}`)

  // 生成公钥
  var publicKeyBuffer = secp256k1.G
    .multiply(BigInteger.fromBuffer(privateKeyBuffer))
    .getEncoded(compressed)
  console.log(`publicKey = ${publicKeyBuffer.toString('hex')}`)

  // 生成地址
  const keyhash = bitcoin.crypto.hash160(publicKeyBuffer)
  const scriptSig = bitcoin.script.witnessPubKeyHash.output.encode(keyhash)
  const addressBytes = bitcoin.crypto.hash160(scriptSig)
  const outputScript = bitcoin.script.scriptHash.output.encode(addressBytes)
  const address = bitcoin.address.fromOutputScript(outputScript, bitcoin.networks.bitcoin)
  assert(address === '3GwGTSWsEs4dmkHKfRfCzgHvR8pfDuwUxp')
  console.log(`address = ${address}\n`)
}

function base58PrivateKeyToAddress() {
  // 私钥
  let privateKey = 'LJFTtJ173LwSM9F2q1WYDfPZNR3EZuk1Miqt5V4hFNmZvckpAY4d'
  console.log(`privateKey = ${privateKey}`)
  const {version, privateKey: privateKeyBuffer, compressed} = wif.decode(privateKey)

  // 生成公钥
  var publicKeyBuffer = secp256k1.G
    .multiply(BigInteger.fromBuffer(privateKeyBuffer))
    .getEncoded(compressed)
  console.log(`publicKey = ${publicKeyBuffer.toString('hex')}`)

  // 生成地址
  const keyhash = bitcoin.crypto.hash160(publicKeyBuffer)
  const scriptSig = bitcoin.script.witnessPubKeyHash.output.encode(keyhash)
  const addressBytes = bitcoin.crypto.hash160(scriptSig)
  const outputScript = bitcoin.script.scriptHash.output.encode(addressBytes)
  const address = bitcoin.address.fromOutputScript(outputScript, bitcoin.networks.bitcoin)
  assert(address === '3GwGTSWsEs4dmkHKfRfCzgHvR8pfDuwUxp')
  console.log(`address = ${address}\n`)
}

hexPrivateKeyToAddress()
base58PrivateKeyToAddress()
