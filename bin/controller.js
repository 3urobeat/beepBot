//This file controls all shards and can coordinate actions between them

const v         = require('./vars.js')

const fs        = require('fs')
const Discord   = require('discord.js');

const logger     = v.logger
//const shardcount = Math.round(cache.totalservers / 2500) + 1 //one shard serves 2500 servers

//logger('info', 'controller.js', `Starting the bot with ${shardcount} shard(s)!`, true)

if (v.config.loginmode === "normal") token = v.tokenpath.token //get token to let Manager know how many shards it has to start
    else token = v.tokenpath.testtoken

//Start needed shards
const Manager = new Discord.ShardingManager('./bin/shard.js', {
    totalShards: 'auto',
    token: token });

Manager.spawn()

Manager.on('shardCreate', (shard) => { 
    logger('info', 'controller.js', `- Spawned shard ${shard.id} -`, true, true)
});