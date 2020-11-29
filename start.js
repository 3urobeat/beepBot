//This file can restart the bot without restarting the node process
var config = require('./bin/config.json')

require(config.filetostart)