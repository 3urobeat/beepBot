//This file can restart the bot without restarting the node process
var config = require('./bin/config.json')

Object.keys(require.cache).forEach(function(key) { delete require.cache[key] }) //clear cache of everything in case this is a restart

require(config.filetostart)