//This file starts all shards and can coordinate actions between them

const v         = require('./vars.js')
v.checkm8();

const Discord   = require('discord.js');

var logger      = v.logger //make it more simple to interact with it
const ascii     = v.randomstring(v.asciipath.ascii) //set random ascii for this bootup

/* ------------ Initialise startup ------------ */
logger("", "", "\n\n", true, true)
logger('info', 'controller.js', `Initiating bootup sequence...`)
logger("", "", `\n${ascii}\n`, true)
logger('info', 'controller.js', "Loading...", true)

//Log the startup in the cmduse.txt file
v.fs.appendFile("./bin/cmduse.txt", ` \nStarting ${v.config.version} in ${v.config.loginmode} mode. ${v.d()}]\n`, err => {
    if (err) logger('error', 'controller.js', "writing startup to cmduse.txt error: " + err) });

if (process.platform == "win32") { //set node process name to find it in task manager etc.
    process.title = `3urobeat's beepBot v${v.config.version} | ${process.platform}` //Windows allows long terminal/process names
} else {
    process.stdout.write(`${String.fromCharCode(27)}]0;3urobeat's beepBot v${v.config.version} | ${process.platform}${String.fromCharCode(7)}`) //sets terminal title (thanks: https://stackoverflow.com/a/30360821/12934162)
    process.title = `beepBot` } //sets process title in task manager etc.


/* -------------- Start needed shards -------------- */
if (v.config.loginmode === "normal") {
    BOTNAME   = "beepBot";
    BOTAVATAR = v.botdefaultavatar;
    token     = v.tokenpath.token //get token to let Manager know how many shards it has to start
} else { 
    BOTNAME   = "beepTestBot";
    BOTAVATAR = v.testbotdefaultavatar;
    token     = v.tokenpath.testtoken
}

const Manager = new Discord.ShardingManager('./bin/bot.js', {
    shardArgs: [],
    totalShards: "auto",
    token: token });

Manager.spawn(Manager.totalShards).catch(err => { logger("error", "controller.js", `Failed to start shard: ${err}`) }) //10000 is the delay before trying to respawn a shard

/* -------------- shardCreate Event -------------- */
Manager.on('shardCreate', (shard) => { 
    logger('info', 'controller.js', `Spawned shard ${shard.id}!`, false, true)

    if (shard.id == 0 || shard.id == 1) {
        /* -------------- All shards started -------------- */

        logger("", "", "\n*---------=----------[\x1b[34mINFO | controller.js\x1b[0m]---------=----------*", true)
        logger("", "", `> Started ${BOTNAME} ${v.config.version} by ${v.BOTOWNER}`, true)

        if (v.config.shards > 1) logger(`> ${v.config.shards} shards running in \x1b[32m${v.config.loginmode}\x1b[0m mode on ${process.platform}`, true); 
            else logger("", "", `> Running in \x1b[32m${v.config.loginmode}\x1b[0m mode on ${process.platform}.`, true);

        if (Manager.totalShards == "auto") logger("", "", `> ShardManager is running in automatic mode...`)
            else logger("", "", `> ShardManager is running with ${Manager.totalShards - 1} shards...`)

        if (v.config.status == "online") var configstatus = "\x1b[32monline\x1b[0m"
        if (v.config.status == "idle")   var configstatus = "\x1b[33midle\x1b[0m"
        if (v.config.status == "dnd")    var configstatus = "\x1b[91mdnd\x1b[0m"
        logger("", "", `> Set Presence to ${configstatus} - Game Rotation every ${v.config.gamerotateseconds} sec`)

        logger("", "", "*--------------------------------------------------------------*\n ", true)


    }
});