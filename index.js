#!/usr/bin/env node

const crypto = require('crypto')
const assert = require('assert')

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
          process.stdout.write("\033[2K\033[200D" + question + ": " + Array(rl.line.length+1).join("*"));
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
  const cipher = crypto.createCipher(algorithm, password)
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

function test() {
  const words = 'Mayor Ben McAdams posed as a homeless person for 3 days and 2 nights'
  const password = 'Yahoo'
  const encryptedWords = encrypt(password, words)
  assert(encryptedWords === '077b7150ff57db8eb20f8bccd10dfc8827acbd5690a1607241db01956649513856cdee655daabc2fd34dc4a16f984e8022807985403a4b13dc2a18ad49ef7cdeb56ec3c9')
  assert(words === decrypt(password, encryptedWords))
}

async function main() {
  const choice = await ask('Select your choice: 1. encrypt 2. decrypt')
  if (choice === '1') {
    const words = await ask('Input your words')
    const password = await ask('Input your password', true)
    console.log('EncryptedWords: ' + encrypt(password, words))
  } else if (choice === '2') {
    const encryptedWords = await ask('input your encrypted words')
    const password = await ask('input your password', true)
    console.log('original words: ' + decrypt(password, encryptedWords))
  } else {
    console.log('choice must be 1 or 2')
  }
  rl.close();
}

test()
main()