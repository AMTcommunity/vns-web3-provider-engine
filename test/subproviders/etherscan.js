const sha3 = require('ethereumjs-util').sha3;
const test = require('tape')
const ProviderEngine = require('../../index.js')
const createPayload = require('../../util/create-payload.js')
const EtherscanSubprovider = require('../../subproviders/etherscan')

test('etherscan vns_getBlockTransactionCountByNumber', function(t) {
  t.plan(3)

  var engine = new ProviderEngine()
  var etherscan = new EtherscanSubprovider()
  engine.addProvider(etherscan)
  engine.start()
  engine.sendAsync(createPayload({
    method: 'vns_getBlockTransactionCountByNumber',
    params: [
      '0x132086'
    ],
  }), function(err, response){
    t.ifError(err, 'throw no error')
    t.ok(response, 'has response')
    t.equal(response.result, '0x8')
    t.end()
  })
})

test('etherscan vns_getTransactionByHash', function(t) {
  t.plan(3)

  var engine = new ProviderEngine()
  var etherscan = new EtherscanSubprovider()
  engine.addProvider(etherscan)
  engine.start()
  engine.sendAsync(createPayload({
    method: 'vns_getTransactionByHash',
    params: [
      '0xe420d77c4f8b5bf95021fa049b634d5e3f051752a14fb7c6a8f1333c37cdf817'
    ],
  }), function(err, response){
    t.ifError(err, 'throw no error')
    t.ok(response, 'has response')
    t.equal(response.result.nonce, '0xd', 'nonce matches known nonce')
    t.end()
  })
})

test('etherscan vns_blockNumber', function(t) {
  t.plan(3)

  var engine = new ProviderEngine()
  var etherscan = new EtherscanSubprovider()
  engine.addProvider(etherscan)
  engine.start()
  engine.sendAsync(createPayload({
    method: 'vns_blockNumber',
    params: [],
  }), function(err, response){
    t.ifError(err, 'throw no error')
    t.ok(response, 'has response')
    t.notEqual(response.result, '0x', 'block number does not equal 0x')
    t.end()
  })
})

test('etherscan vns_getBlockByNumber', function(t) {
  t.plan(3)

  var engine = new ProviderEngine()
  var etherscan = new EtherscanSubprovider()
  engine.addProvider(etherscan)
  engine.start()
  engine.sendAsync(createPayload({
    method: 'vns_getBlockByNumber',
    params: [
      '0x149a2a',
      true
    ],
  }), function(err, response){
    t.ifError(err, 'throw no error')
    t.ok(response, 'has response')
    t.equal(response.result.nonce, '0x80fdd9b71954f9fc', 'nonce matches known nonce')
    t.end()
  })
})

test('etherscan vns_getBalance', function(t) {
  t.plan(3)

  var engine = new ProviderEngine()
  var etherscan = new EtherscanSubprovider()
  engine.addProvider(etherscan)
  engine.start()
  engine.sendAsync(createPayload({
    method: 'vns_getBalance',
    params: [
      '0xa601ea86ae7297e78a54f4b6937fbc222b9d87f4',
      'latest'
    ],
  }), function(err, response){
    t.ifError(err, 'throw no error')
    t.ok(response, 'has response')
    t.notEqual(response.result, '0', 'balance does not equal zero')
    t.end()
  })
})

test('etherscan vns_call', function(t) {
  t.plan(3)

  var signature = Buffer.concat([sha3("getLatestBlock()", 256)], 4).toString('hex');
  var engine = new ProviderEngine()
  var etherscan = new EtherscanSubprovider()
  engine.addProvider(etherscan)
  engine.start()
  engine.sendAsync(createPayload({
    method: 'vns_call',
    params: [{
      to: '0x4EECf99D543B278106ac0c0e8ffe616F2137f10a',
      data : signature
    },
      'latest'
    ],
  }), function(err, response){
    t.ifError(err, 'throw no error')
    t.ok(response, 'has response')
    t.notEqual(response.result, '0x', 'vns_call to getLatestBlock() does not equal 0x')
    t.end()
  })
})
