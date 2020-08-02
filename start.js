const Discord   = require('discord.js');
const Manager   = new Discord.ShardingManager('./bin/index.js');
const botconfig = require("./bin/config.json")

Manager.spawn(botconfig.shards)