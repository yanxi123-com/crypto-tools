#!/usr/bin/env node

const crypto = require('crypto')
const assert = require('assert')
const { createCipheriv, createHash } = require('crypto');

const bip49 = require('./bip49')
const ecc = require('./eos/ecc')

const algorithm = 'aes-256-ctr'
const readline = require('readline');

const stdin = process.stdin;
const stdout = process.stdout;
stdin.setEncoding('utf8');
const rl = readline.createInterface({
  input: stdin,
  output: stdout
});

function ask(question, hidden) {
  if (hidden) {
    stdin.resume();
    let i = 0;
    stdin.on('data', char => {
      switch (String(char)) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.pause();
          break;
        default:
          stdout.write("\033[2K\033[200D" + question + ": " + Array(rl.line.length+1).join("*"));
          i++;
          break;
      }
    });
  }
  return new Promise(resolve => {
    rl.question(question + ': ', (data) => {
      if (!data || data === '') {
        stdout.write('Please enter some data... \n');
        return ask(question);
      }
      else {
        resolve(data);
      }
    });
  })
}

function encrypt (password, words) {
  const [keyHex, ivHex] = compute(algorithm, password);
  const key = Buffer.from(keyHex, 'hex');
  const iv  = Buffer.from(ivHex, 'hex');
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let crypted = cipher.update(words, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

function decrypt(password, encryptedWords) {
  const decipher = crypto.createDecipher(algorithm, password)
  let dec = decipher.update(encryptedWords, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}

function sizes(cipher) {
  for (let nkey = 1, niv = 0;;) {
    try {
      createCipheriv(cipher, '.'.repeat(nkey), '.'.repeat(niv));
      return [nkey, niv];
    } catch (e) {
      if (/invalid iv length/i.test(e.message)) niv += 1;
      else if (/invalid key length/i.test(e.message)) nkey += 1;
      else throw e;
    }
  }
}

function compute(cipher, passphrase) {
  let [nkey, niv] = sizes(cipher);
  for (let key = '', iv = '', p = '';;) {
    const h = createHash('md5');
    h.update(p, 'hex');
    h.update(passphrase);
    p = h.digest('hex');
    let n, i = 0;
    n = Math.min(p.length-i, 2*nkey);
    nkey -= n/2, key += p.slice(i, i+n), i += n;
    n = Math.min(p.length-i, 2*niv);
    niv -= n/2, iv += p.slice(i, i+n), i += n;
    if (nkey+niv === 0) return [key, iv];
  }
}

function test() {
  const words = 'Mayor Ben McAdams posed as a homeless person for 3 days and 2 nights'
  const password = 'Yahoo'
  const encryptedWords = encrypt(password, words)
  assert(encryptedWords === '077b7150ff57db8eb20f8bccd10dfc8827acbd5690a1607241db01956649513856cdee655daabc2fd34dc4a16f984e8022807985403a4b13dc2a18ad49ef7cdeb56ec3c9')
  assert(words === decrypt(password, encryptedWords))
}

async function main() {
  const choice = await ask(`Select
     1. encrypt
     2. decrypt
     3. generate mnemonic (bip49)
     4. show addresses from mnemonic (BTC m/49'/0'/0')
     5. EOS private to public\nYour choice`)
  if (choice === '1') {
    const words = await ask('Input your words')
    const password = await ask('Input your password', true)
    console.log('EncryptedWords: ' + encrypt(password, words))
  } else if (choice === '2') {
    const encryptedWords = await ask('Input your encrypted words')
    const password = await ask('Input your password', true)
    try {
      console.log('original words: ' + decrypt(password, encryptedWords))
    } catch(e) {
      console.log("The encrypted words isn't match with the given password")
    }
  } else if (choice === '3') {
    console.log('random mnemonic: ', bip49.generateMnemonic())
  } else if (choice === '4') {
    const mnemonic = await ask('Input your mnemonic')
    try {
      bip49.printAddresses(mnemonic)
    } catch (e) {
      console.log('mnemonic is invalid')
    }
  } else if (choice === '5') {
    const private = await ask('Input your privateKey', true)
    try {
      const public = ecc.privateToPublic(private)
      console.log('Public Key: ' + public)
    } catch (e) {
      console.log('private key is invalid')
    }
  } else {
    console.log('the choice is wrong')
  }
  rl.close();
}

test()
main()
