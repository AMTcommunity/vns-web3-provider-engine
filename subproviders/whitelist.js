const inherits = require('util').inherits
const Subprovider = require('./subprovider.js')

module.exports = WhitelistProvider

inherits(WhitelistProvider, Subprovider)

function WhitelistProvider(methods){
  this.methods = methods;

  if (this.methods == null) {
    this.methods = [
      'vns_gasPrice',
      'vns_blockNumber',
      'vns_getBalance',
      'vns_getBlockByHash',
      'vns_getBlockByNumber',
      'vns_getBlockTransactionCountByHash',
      'vns_getBlockTransactionCountByNumber',
      'vns_getCode',
      'vns_getStorageAt',
      'vns_getTransactionByBlockHashAndIndex',
      'vns_getTransactionByBlockNumberAndIndex',
      'vns_getTransactionByHash',
      'vns_getTransactionCount',
      'vns_getTransactionReceipt',
      'vns_getUncleByBlockHashAndIndex',
      'vns_getUncleByBlockNumberAndIndex',
      'vns_getUncleCountByBlockHash',
      'vns_getUncleCountByBlockNumber',
      'vns_sendRawTransaction',
      'vns_getLogs'
    ];
  }
}

WhitelistProvider.prototype.handleRequest = function(payload, next, end){
  if (this.methods.indexOf(payload.method) >= 0) {
    next();
  } else {
    end(new Error("Method '" + payload.method + "' not allowed in whitelist."));
  }
}
