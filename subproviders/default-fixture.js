const inherits = require('util').inherits
const extend = require('xtend')
const FixtureProvider = require('./fixture.js')
const version = require('../package.json').version

module.exports = DefaultFixtures

inherits(DefaultFixtures, FixtureProvider)

function DefaultFixtures(opts) {
  const self = this
  opts = opts || {}
  var responses = extend({
    web3_clientVersion: 'ProviderEngine/v'+version+'/javascript',
    net_listening: true,
    vns_hashrate: '0x00',
    vns_mining: false,
  }, opts)
  FixtureProvider.call(self, responses)
}
