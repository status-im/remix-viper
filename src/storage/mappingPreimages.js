var global = require('../helpers/global')

module.exports = {
  extractMappingPreimages: extractMappingPreimages
}

async function extractMappingPreimages (storageViewer) {
  return new Promise((resolve, reject) => {
    storageViewer.storageRange(function (error, storage) {
      if (!error) {
        decodeMappingsKeys(storage, (error, mappings) => {
          if (error) {
            reject(error)
          } else {
            resolve(mappings)
          }
        })
      } else {
        reject(error)
      }
    })
  })
}

async function decodeMappingsKeys (storage, callback) {
  var ret = {}
  for (var hashedLoc in storage) {
    var preimage
    try {
      preimage = await getPreimage(storage[hashedLoc].key)
    } catch (e) {
    }
    if (preimage) {
      // got preimage!
      // get mapping position (i.e. storage slot), its the last 32 bytes
      var slotByteOffset = preimage.length - 64
      var mappingSlot = preimage.substr(slotByteOffset)
      var mappingKey = preimage.substr(0, slotByteOffset)
      if (!ret[mappingSlot]) {
        ret[mappingSlot] = {}
      }
      ret[mappingSlot][mappingKey] = preimage
    }
  }
  callback(null, ret)
}

function getPreimage (key) {
  return new Promise((resolve, reject) => {
    global.web3.debug.preimage(key, function (error, preimage) {
      if (error) {
        reject(error)
      } else {
        resolve(preimage)
      }
    })
  })
}