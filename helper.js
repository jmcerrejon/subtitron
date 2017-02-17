exports.downloadFile = configuration => {
  var request = require('request')
  var fs = require('fs')
  return new Promise(function (resolve, reject) {
    // Save variable to know progress
    var receivedBytes = 0
    var totalBytes = 0

    var req = request({
      method: 'GET',
      uri: configuration.remoteFile
    })

    var out = fs.createWriteStream(configuration.localFile)
    req.pipe(out)

    req.on('response', data => {
      // Change the total bytes value to get progress later.
      totalBytes = parseInt(data.headers['content-length'])
    })

    // Get progress if callback exists
    if (configuration.hasOwnProperty('onProgress')) {
      req.on('data', chunk => {
        // Update the received bytes
        receivedBytes += chunk.length

        configuration.onProgress(receivedBytes, totalBytes)
      })
    } else {
      req.on('data', chunk => {
        // Update the received bytes
        receivedBytes += chunk.length
      })
    }

    req.on('end', () => {
      resolve()
    })
  })
}
