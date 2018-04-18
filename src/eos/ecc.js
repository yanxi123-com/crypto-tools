const ecc = require('eosjs-ecc')

function createRandomKey () {
  ecc.randomKey().then(privateKey => {
    const private = privateKey.toString()
    const public = ecc.privateToPublic(private)
    console.log(`private: ${private} public: ${public}`)
  })
}

module.exports.privateToPublic = ecc.privateToPublic
