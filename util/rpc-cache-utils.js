const stringify = require('json-stable-stringify')

module.exports = {
  cacheIdentifierForPayload: cacheIdentifierForPayload,
  canCache: canCache,
  blockTagForPayload: blockTagForPayload,
  paramsWithoutBlockTag: paramsWithoutBlockTag,
  blockTagParamIndex: blockTagParamIndex,
  cacheTypeForPayload: cacheTypeForPayload,
}

function cacheIdentifierForPayload(payload, opts = {}){
  if (!canCache(payload)) return null
  const { includeBlockRef } = opts
  const params = includeBlockRef ? payload.params : paramsWithoutBlockTag(payload)
  return payload.method + ':' + stringify(params)
}

function canCache(payload){
  return cacheTypeForPayload(payload) !== 'never'
}

function blockTagForPayload(payload){
  var index = blockTagParamIndex(payload);

  // Block tag param not passed.
  if (index >= payload.params.length) {
    return null;
  }

  return payload.params[index];
}

function paramsWithoutBlockTag(payload){
  var index = blockTagParamIndex(payload);

  // Block tag param not passed.
  if (index >= payload.params.length) {
    return payload.params;
  }

  // vns_getBlockByNumber has the block tag first, then the optional includeTx? param
  if (payload.method === 'vns_getBlockByNumber') {
    return payload.params.slice(1);
  }

  return payload.params.slice(0,index);
}

function blockTagParamIndex(payload){
  switch(payload.method) {
    // blockTag is third param
    case 'vns_getStorageAt':
      return 2
    // blockTag is second param
    case 'vns_getBalance':
    case 'vns_getCode':
    case 'vns_getTransactionCount':
    case 'vns_call':
    case 'vns_estimateGas':
      return 1
    // blockTag is first param
    case 'vns_getBlockByNumber':
      return 0
    // there is no blockTag
    default:
      return undefined
  }
}

function cacheTypeForPayload(payload) {
  switch (payload.method) {
    // cache permanently
    case 'web3_clientVersion':
    case 'web3_sha3':
    case 'vns_protocolVersion':
    case 'vns_getBlockTransactionCountByHash':
    case 'vns_getUncleCountByBlockHash':
    case 'vns_getCode':
    case 'vns_getBlockByHash':
    case 'vns_getTransactionByHash':
    case 'vns_getTransactionByBlockHashAndIndex':
    case 'vns_getTransactionReceipt':
    case 'vns_getUncleByBlockHashAndIndex':
    case 'vns_getCompilers':
    case 'vns_compileLLL':
    case 'vns_compileSolidity':
    case 'vns_compileSerpent':
    case 'shh_version':
      return 'perma'

    // cache until fork
    case 'vns_getBlockByNumber':
    case 'vns_getBlockTransactionCountByNumber':
    case 'vns_getUncleCountByBlockNumber':
    case 'vns_getTransactionByBlockNumberAndIndex':
    case 'vns_getUncleByBlockNumberAndIndex':
      return 'fork'

    // cache for block
    case 'vns_gasPrice':
    case 'vns_getBalance':
    case 'vns_getStorageAt':
    case 'vns_getTransactionCount':
    case 'vns_call':
    case 'vns_estimateGas':
    case 'vns_getFilterLogs':
    case 'vns_getLogs':
    case 'vns_blockNumber':
      return 'block'

    // never cache
    case 'net_version':
    case 'net_peerCount':
    case 'net_listening':
    case 'vns_syncing':
    case 'vns_sign':
    case 'vns_coinbase':
    case 'vns_mining':
    case 'vns_hashrate':
    case 'vns_accounts':
    case 'vns_sendTransaction':
    case 'vns_sendRawTransaction':
    case 'vns_newFilter':
    case 'vns_newBlockFilter':
    case 'vns_newPendingTransactionFilter':
    case 'vns_uninstallFilter':
    case 'vns_getFilterChanges':
    case 'vns_getWork':
    case 'vns_submitWork':
    case 'vns_submitHashrate':
    case 'db_putString':
    case 'db_getString':
    case 'db_putHex':
    case 'db_getHex':
    case 'shh_post':
    case 'shh_newIdentity':
    case 'shh_hasIdentity':
    case 'shh_newGroup':
    case 'shh_addToGroup':
    case 'shh_newFilter':
    case 'shh_uninstallFilter':
    case 'shh_getFilterChanges':
    case 'shh_getMessages':
      return 'never'
  }
}
