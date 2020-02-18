const test = require('tape')
const asyncWaterfall = require('async').waterfall
const ProviderEngine = require('../index.js')
const FilterProvider = require('../subproviders/filters.js')
const TestBlockProvider = require('./util/block.js')
const createPayload = require('../util/create-payload.js')
const injectMetrics = require('./util/inject-metrics')


filterTest('block filter - basic', { method: 'vns_newBlockFilter' },
  function afterInstall(t, testMeta, response, cb){
    var block = testMeta.block = testMeta.blockProvider.nextBlock()
    cb()
  },
  function filterChangesOne(t, testMeta, response, cb){
    var results = response.result
    var returnedBlockHash = response.result[0]
    t.equal(results.length, 1, 'correct number of results')
    t.equal(returnedBlockHash, testMeta.block.hash, 'correct result')
    cb()
  },
  function filterChangesTwo(t, testMeta, response, cb){
    var results = response.result
    t.equal(results.length, 0, 'correct number of results')
    cb()
  }
)

filterTest('log filter - basic', {
    method: 'vns_newFilter',
    params: [{
      topics: ['0x00000000000000000000000000000000000000000000000000deadbeefcafe01']
    }],
  },
  function afterInstall(t, testMeta, response, cb){
    testMeta.tx = testMeta.blockProvider.addTx({
      hash: '0x0000000000000000000000000000000000000000000000000000000000000001',
      _logTopics: ['0x00000000000000000000000000000000000000000000000000deadbeefcafe01']
    })
    testMeta.badTx = testMeta.blockProvider.addTx({
      _logTopics: ['0x00000000000000000000000000000000000000000000000000deadbeefcafe02']
    })
    var block = testMeta.block = testMeta.blockProvider.nextBlock()
    cb()
  },
  function filterChangesOne(t, testMeta, response, cb){
    var results = response.result
    var matchedLog = response.result[0]
    t.equal(results.length, 1, 'correct number of results')
    t.equal(matchedLog.transactionHash, testMeta.tx.hash, 'result log matches tx hash')
    cb()
  },
  function filterChangesTwo(t, testMeta, response, cb){
    var results = response.result
    t.equal(results.length, 0, 'correct number of results')
    cb()
  }
)

filterTest('log filter - mixed case', {
    method: 'vns_newFilter',
    params: [{
      address: '0x00000000000000000000000000000000aAbBcCdD',
      topics: ['0x00000000000000000000000000000000000000000000000000DeadBeefCafe01']
    }],
  },
  function afterInstall(t, testMeta, response, cb){
    testMeta.tx = testMeta.blockProvider.addTx({
      hash: '0x0000000000000000000000000000000000000000000000000000000000000001',
      _logAddress: '0x00000000000000000000000000000000AABBCCDD',
      _logTopics: ['0x00000000000000000000000000000000000000000000000000DEADBEEFCAFE01']
    })
    testMeta.badTx = testMeta.blockProvider.addTx({
      _logAddress: '0x00000000000000000000000000000000aAbBcCdD',
      _logTopics: ['0x00000000000000000000000000000000000000000000000000DeadBeefCafe02']
    })
    var block = testMeta.block = testMeta.blockProvider.nextBlock()
    cb()
  },
  function filterChangesOne(t, testMeta, response, cb){
    var results = response.result
    var matchedLog = response.result[0]
    t.equal(results.length, 1, 'correct number of results')
    t.equal(matchedLog && matchedLog.transactionHash, testMeta.tx.hash, 'result log matches tx hash')
    cb()
  },
  function filterChangesTwo(t, testMeta, response, cb){
    var results = response.result
    t.equal(results.length, 0, 'correct number of results')
    cb()
  }
)

filterTest('log filter - address array', {
    method: 'vns_newFilter',
    params: [{
      address: [
        '0x00000000000000000000000000000000aAbBcCdD',
        '0x00000000000000000000000000000000a1b2c3d4'],
      topics: ['0x00000000000000000000000000000000000000000000000000DeadBeefCafe01']
    }],
  },
  function afterInstall(t, testMeta, response, cb){
    testMeta.tx = testMeta.blockProvider.addTx({
      hash: '0x0000000000000000000000000000000000000000000000000000000000000001',
      _logAddress: '0x00000000000000000000000000000000AABBCCDD',
      _logTopics: ['0x00000000000000000000000000000000000000000000000000DEADBEEFCAFE01']
    })
    testMeta.badTx = testMeta.blockProvider.addTx({
      _logAddress: '0x00000000000000000000000000000000aAbBcCdD',
      _logTopics: ['0x00000000000000000000000000000000000000000000000000DeadBeefCafe02']
    })
    var block = testMeta.block = testMeta.blockProvider.nextBlock()
    cb()
  },
  function filterChangesOne(t, testMeta, response, cb){
    var results = response.result
    var matchedLog = response.result[0]
    t.equal(results.length, 1, 'correct number of results')
    t.equal(matchedLog && matchedLog.transactionHash, testMeta.tx.hash, 'result log matches tx hash')
    cb()
  },
  function filterChangesTwo(t, testMeta, response, cb){
    var results = response.result
    t.equal(results.length, 0, 'correct number of results')
    cb()
  }
)

filterTest('log filter - and logic', {
    method: 'vns_newFilter',
    params: [{
      topics: [
      '0x00000000000000000000000000000000000000000000000000deadbeefcafe01',
      '0x00000000000000000000000000000000000000000000000000deadbeefcafe02',
      ],
    }],
  },
  function afterInstall(t, testMeta, response, cb){
    testMeta.tx = testMeta.blockProvider.addTx({
      hash: '0x0000000000000000000000000000000000000000000000000000000000000001',
      _logTopics: [
        '0x00000000000000000000000000000000000000000000000000deadbeefcafe01',
        '0x00000000000000000000000000000000000000000000000000deadbeefcafe02',
      ],
    })
    testMeta.badTx = testMeta.blockProvider.addTx({
      _logTopics: [
        '0x00000000000000000000000000000000000000000000000000deadbeefcafe02',
        '0x00000000000000000000000000000000000000000000000000deadbeefcafe01',
      ],
    })
    var block = testMeta.block = testMeta.blockProvider.nextBlock()
    cb()
  },
  function filterChangesOne(t, testMeta, response, cb){
    var results = response.result
    var matchedLog = response.result[0]
    t.equal(results.length, 1, 'correct number of results')
    t.equal(matchedLog && matchedLog.transactionHash, testMeta.tx.hash, 'result log matches tx hash')
    cb()
  },
  function filterChangesTwo(t, testMeta, response, cb){
    var results = response.result
    t.equal(results.length, 0, 'correct number of results')
    cb()
  }
)

filterTest('log filter - or logic', {
    method: 'vns_newFilter',
    params: [{
      topics: [
        [
          '0x00000000000000000000000000000000000000000000000000deadbeefcafe01',
          '0x00000000000000000000000000000000000000000000000000deadbeefcafe02',
        ],
      ],
    }],
  },
  function afterInstall(t, testMeta, response, cb){
    testMeta.tx1 = testMeta.blockProvider.addTx({
      hash: '0x0000000000000000000000000000000000000000000000000000000000000001',
      _logTopics: [
        '0x00000000000000000000000000000000000000000000000000deadbeefcafe01',
      ],
    })
    testMeta.tx2 = testMeta.blockProvider.addTx({
      hash: '0x0000000000000000000000000000000000000000000000000000000000000002',
      _logTopics: [
        '0x00000000000000000000000000000000000000000000000000deadbeefcafe02',
      ],
    })
    testMeta.badTx = testMeta.blockProvider.addTx({
      _logTopics: [
        '0x00000000000000000000000000000000000000000000000000deadbeefcafe03',
      ],
    })
    var block = testMeta.block = testMeta.blockProvider.nextBlock()
    cb()
  },
  function filterChangesOne(t, testMeta, response, cb){
    var results = response.result
    var matchedLog1 = response.result[0]
    var matchedLog2 = response.result[1]
    t.equal(results.length, 2, 'correct number of results')
    t.equal(matchedLog1.transactionHash, testMeta.tx1.hash, 'result log matches tx hash')
    t.equal(matchedLog2.transactionHash, testMeta.tx2.hash, 'result log matches tx hash')
    cb()
  },
  function filterChangesTwo(t, testMeta, response, cb){
    var results = response.result
    t.equal(results.length, 0, 'correct number of results')
    cb()
  }
)

filterTest('log filter - wildcard logic', {
    method: 'vns_newFilter',
    params: [{
      topics: [
        null,
        '0x00000000000000000000000000000000000000000000000000deadbeefcafe02',
      ],
    }],
  },
  function afterInstall(t, testMeta, response, cb){
    testMeta.tx1 = testMeta.blockProvider.addTx({
      hash: '0x0000000000000000000000000000000000000000000000000000000000000001',
      _logTopics: [
        '0x00000000000000000000000000000000000000000000000000deadbeefcafe01',
        '0x00000000000000000000000000000000000000000000000000deadbeefcafe02',
      ],
    })
    testMeta.tx2 = testMeta.blockProvider.addTx({
      hash: '0x0000000000000000000000000000000000000000000000000000000000000002',
      _logTopics: [
        '0x00000000000000000000000000000000000000000000000000deadbeefcafe02',
        '0x00000000000000000000000000000000000000000000000000deadbeefcafe02',
      ],
    })
    testMeta.badTx = testMeta.blockProvider.addTx({
      _logTopics: [
        '0x00000000000000000000000000000000000000000000000000deadbeefcafe01',
        '0x00000000000000000000000000000000000000000000000000deadbeefcafe01',
      ],
    })
    var block = testMeta.block = testMeta.blockProvider.nextBlock()
    cb()
  },
  function filterChangesOne(t, testMeta, response, cb){
    var results = response.result
    var matchedLog1 = response.result[0]
    var matchedLog2 = response.result[1]
    t.equal(results.length, 2, 'correct number of results')
    t.equal(matchedLog1.transactionHash, testMeta.tx1.hash, 'result log matches tx hash')
    t.equal(matchedLog2.transactionHash, testMeta.tx2.hash, 'result log matches tx hash')
    cb()
  },
  function filterChangesTwo(t, testMeta, response, cb){
    var results = response.result
    t.equal(results.length, 0, 'correct number of results')
    cb()
  }
)

filterTest('vns_getFilterLogs called with non log filter id should return []', { method: 'vns_newBlockFilter' },
  function afterInstall(t, testMeta, response, cb){
    var block = testMeta.block = testMeta.blockProvider.nextBlock()
    testMeta.engine.once('block', function(){
      testMeta.engine.sendAsync(createPayload({ method: 'vns_getFilterLogs', params: [testMeta.filterId] }), function(err, response){
        t.ifError(err, 'did not error')
        t.ok(response, 'has response')
        t.ok(response.result, 'has response.result')

        t.equal(testMeta.filterProvider.getWitnessed('vns_getFilterLogs').length, 1, 'filterProvider did see "vns_getFilterLogs')
        t.equal(testMeta.filterProvider.getHandled('vns_getFilterLogs').length, 1, 'filterProvider did handle "vns_getFilterLogs')

        t.equal(response.result.length, 0, 'vns_getFilterLogs returned an empty result for a non log filter')
        cb()
      })
    })
  })

// util

function filterTest(label, filterPayload, afterInstall, filterChangesOne, filterChangesTwo){
  test('filters - '+label, function(t){
    // t.plan(8)

    // install filter
    // new block
    // check filter

    var testMeta = {}

    // handle "test_rpc"
    var filterProvider = testMeta.filterProvider = injectMetrics(new FilterProvider())
    // handle block requests
    var blockProvider = testMeta.blockProvider = injectMetrics(new TestBlockProvider())

    var engine = testMeta.engine = new ProviderEngine({
      pollingInterval: 20,
      pollingShouldUnref: false,
    })
    engine.addProvider(filterProvider)
    engine.addProvider(blockProvider)

    asyncWaterfall([
      // wait for first block
      (cb) => {
        engine.once('block', () => cb())
        engine.start()
      },
      // install block filter
      (cb) => {
        engine.sendAsync(createPayload(filterPayload), cb)
      },
      // validate install
      (response, cb) => {
        t.ok(response, 'has response')

        var method = filterPayload.method

        t.equal(filterProvider.getWitnessed(method).length, 1, 'filterProvider did see "'+method+'"')
        t.equal(filterProvider.getHandled(method).length, 1, 'filterProvider did handle "'+method+'"')

        var filterId = testMeta.filterId = response.result

        afterInstall(t, testMeta, response, cb)
      },
      (cb) => {
        if (filterChangesOne) {
          checkFilterChangesOne(cb)
        } else {
          cb()
        }
      },
      (cb) => {
        if (filterChangesTwo) {
          checkFilterChangesTwo(cb)
        } else {
          cb()
        }
      },
    ], (err) => {
      t.ifError(err, 'did not error')
      engine.stop()
      t.end()
    })

    function checkFilterChangesOne (done) {
      asyncWaterfall([
        // wait next block
        (cb) => {
          engine.once('block', () => cb())
        },
        // check filter one
        (cb) => {
          var filterId = testMeta.filterId
          engine.sendAsync(createPayload({ method: 'vns_getFilterChanges', params: [filterId] }), cb)
        },
        (response, cb) => {
          t.ok(response, 'has response')
  
          t.equal(filterProvider.getWitnessed('vns_getFilterChanges').length, 1, 'filterProvider did see "vns_getFilterChanges"')
          t.equal(filterProvider.getHandled('vns_getFilterChanges').length, 1, 'filterProvider did handle "vns_getFilterChanges"')
  
          filterChangesOne(t, testMeta, response, cb)
        }
      ], done)
    }

    function checkFilterChangesTwo (done) {
      asyncWaterfall([
        // check filter two
        (cb) => {
          var filterId = testMeta.filterId
          engine.sendAsync(createPayload({ method: 'vns_getFilterChanges', params: [filterId] }), cb)
        },
        (response, cb) => {
          t.ok(response, 'has response')

          t.equal(filterProvider.getWitnessed('vns_getFilterChanges').length, 2, 'filterProvider did see "vns_getFilterChanges"')
          t.equal(filterProvider.getHandled('vns_getFilterChanges').length, 2, 'filterProvider did handle "vns_getFilterChanges"')

          filterChangesTwo(t, testMeta, response, cb)
        },
      ], done)
    }

  })
}
