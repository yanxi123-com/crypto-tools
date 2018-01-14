var wif = require('wif')
var BigInteger = require('bigi')
var ecdsa = require('bitcoinjs-lib/src/ecdsa')
var bcrypto = require('bitcoinjs-lib/src/crypto')
var NETWORKS = require('bitcoinjs-lib/src/networks')
const bs58 = require('bs58')
var baddress = require('bitcoinjs-lib/src/address')
var ecurve = require('ecurve')
var secp256k1 = ecurve.getCurveByName('secp256k1')

function hexPrivateKeyToAddress() {
  // 私钥 Buffer: 32 bytes, 256 bits, 2^256 = 2^8^32 = 2^4^64
  var privateKeyBuffer = new Buffer('0000000000000000000000000000000000000000000000000000000000000001', 'hex')
  var compressed = true

  // 转化成 base58 私钥
  var privateKey = wif.encode(128, privateKeyBuffer, compressed) // version, privateKey, compressed
  console.log(`privateKey = ${privateKey}`)

  // 生成公钥
  var publicKeyBuffer = secp256k1.G
    .multiply(BigInteger.fromBuffer(privateKeyBuffer))
    .getEncoded(compressed)
  console.log(`publicKey = ${publicKeyBuffer.toString('hex')}`)

  // 生成地址
  var address = baddress.toBase58Check(bcrypto.hash160(publicKeyBuffer), NETWORKS.bitcoin.pubKeyHash)
  console.log(`address = ${address}\n`)
}

function base58PrivateKeyToAddress() {
  // 私钥
  let privateKey = 'KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn'
  console.log(`privateKey = ${privateKey}`)
  const {version, privateKey: privateKeyBuffer, compressed} = wif.decode(privateKey)

  // 生成公钥
  var publicKeyBuffer = secp256k1.G
    .multiply(BigInteger.fromBuffer(privateKeyBuffer))
    .getEncoded(compressed)
  console.log(`publicKey = ${publicKeyBuffer.toString('hex')}`)

  // 生成地址
  var address = baddress.toBase58Check(bcrypto.hash160(publicKeyBuffer), NETWORKS.bitcoin.pubKeyHash)
  console.log(`address = ${address}\n`)
}

hexPrivateKeyToAddress()
base58PrivateKeyToAddress()
