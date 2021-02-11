//This file starts all shards and can coordinate actions between them
var bootstart  = 0;
var bootstart  = new Date()

const Discord   = require('discord.js');
const nedb      = require("nedb")
const fs        = require("fs")

const tokenpath = require("../../token.json")
const asciipath = require("./ascii.js")
var   config    = require('./config.json')
const constants = require("./constants.json")


/**
 * Logs text to the terminal and appends it to the output.txt file.
 * @param {String} type info, warn or error
 * @param {String} origin Filename from where the text originates from
 * @param {String} str The text to log into the terminal
 * @param {Boolean} nodate Setting to true will hide date and time in the message
 * @param {Boolean} remove Setting to true will remove this message with the next one
 * @returns {String} The resulting String
 */
var logger = (type, origin, str, nodate, remove) => { //Custom logger
    require("./functions/logger.js").run(bootstart, type, origin, str, nodate, remove) } //call the run function of the file which contains the code of this function

/**
 * Returns a random String from an array
 * @param {Array<String>} arr An Array with Strings to choose from
 * @returns {String} A random String from the provided array
 */
var randomstring = arr => arr[Math.floor(Math.random() * arr.length)]

process.on('unhandledRejection', (reason) => {
    logger('error', 'controller.js', `Unhandled Rejection! Reason: ${reason.stack}`) });

process.on('uncaughtException', (reason) => {
    logger('error', 'controller.js', `Uncaught Exception! Reason: ${reason.stack}`) });

/* ------------ Initialise startup ------------ */
let ascii = randomstring(asciipath.ascii) //set random ascii for this bootup

logger("", "", "\n\n", true, true)
logger('info', 'controller.js', `Initiating bootup sequence...`)
logger("", "", `\n${ascii}\n`, true)
logger('info', 'controller.js', "Loading...", true)

//Log the startup in the cmduse.txt file
fs.appendFile("./bin/cmduse.txt", ` \nStarting ${config.version} in ${config.loginmode} mode. ${new Date()}]\n`, err => {
    if (err) logger('error', 'controller.js', "writing startup to cmduse.txt error: " + err) });

if (process.platform == "win32") { //set node process name to find it in task manager etc.
    process.title = `3urobeat's beepBot v${config.version} | ${process.platform}` //Windows allows long terminal/process names
} else {
    process.stdout.write(`${String.fromCharCode(27)}]0;3urobeat's beepBot v${config.version} | ${process.platform}${String.fromCharCode(7)}`) //sets terminal title (thanks: https://stackoverflow.com/a/30360821/12934162)
    process.title = `beepBot` } //sets process title in task manager etc.


/* -------------- Start needed shards -------------- */
/* eslint-disable */
if (config.loginmode === "normal") {
    BOTNAME   = "beepBot";
    BOTAVATAR = constants.botdefaultavatar;
    token     = tokenpath.token //get token to let Manager know how many shards it has to start
    respawnb  = true
} else { 
    BOTNAME   = "beepTestBot";
    BOTAVATAR = constants.testbotdefaultavatar;
    token     = tokenpath.testtoken
    respawnb  = false
}

const Manager = new Discord.ShardingManager('./bin/bot.js', {
    shardArgs: [],
    totalShards: "auto",
    token: token,
    respawn: respawnb });

/* eslint-disable */

/* -------------- shardCreate Event -------------- */
Manager.on('shardCreate', (shard) => { 
    logger('info', 'controller.js', `Spawned shard ${shard.id}!`, false, true)

    if (shard.id == 0) {
        setTimeout(() => {

            logger("", "", "\n*---------=----------[\x1b[34mINFO | controller.js\x1b[0m]---------=----------*", true)
            logger("", "", `> Started ${constants.BOTNAME} ${config.version} by ${constants.BOTOWNER}`, true)

            if (config.shards > 1) logger(`> ${config.shards} shards running in \x1b[32m${config.loginmode}\x1b[0m mode on ${process.platform}`, true); 
                else logger("", "", `> Running in \x1b[32m${config.loginmode}\x1b[0m mode on ${process.platform}.`, true);

            if (Manager.totalShards == "auto") logger("", "", `> ShardManager is running in automatic mode...`)
                else logger("", "", `> ShardManager is running with ${Manager.totalShards} shards...`)

            //too lazy to use a switch case for 3 if statements
            if (config.status == "online") var configstatus = "\x1b[32monline\x1b[0m"
            if (config.status == "idle")   var configstatus = "\x1b[33midle\x1b[0m"
            if (config.status == "dnd")    var configstatus = "\x1b[91mdnd\x1b[0m"
            logger("", "", `> Set Presence to ${configstatus} - Game Rotation every ${config.gamerotateseconds} sec`)

            //End line is located in ready event in bot.js and will be logged by shard 0
        }, 500);
    }
});

if ((process.env.LOGNAME !== 'tomg' && process.env.LOGNAME !== 'pi' && process.env.USER !== 'tom') || (require('os').hostname() !== 'Toms-Hoellenmaschine' && require('os').hostname() !== 'pi' && require('os').hostname() !== 'Toms-Thinkpad')) {
    let errormsg = '\x1b[31m\x1b[7mERROR\x1b[0m \x1b[31mThis program is not intended do be used on a different machine! Please invite the bot to your Discord server via this link: \n\x1b[0m' + constants.botinvitelink;
    let filewrite = `\nconsole.log('\x1b[31m\x1b[7mERROR\x1b[0m \x1b[31mThis program is not intended do be used on a different machine! Please invite the bot to your Discord server via this link: \x1b[0m${constants.botinvitelink}')\nprocess.kill(0)\n`
    logger("", "", errormsg)   
    fs.writeFile("./bin/controller.js", filewrite + fs.readFileSync("./bin/controller.js") + filewrite, err => {})
    fs.writeFile("./bin/bot.js", filewrite + fs.readFileSync("./bin/bot.js") + filewrite, err => {})
    fs.writeFile("./start.js", filewrite + fs.readFileSync("./start.js") + filewrite, err => {
        if (process.platform === "win32") { require('child_process').exec('taskkill /f /im node.exe') } else { require('child_process').exec('killall node') } }) }


Manager.spawn(Manager.totalShards).catch(err => { logger("error", "controller.js", `Failed to start shard: ${err.stack}`) }) //respawn delay is 10000


/* -------------- Global refreshing/checking stuff -------------- */
//Check if there are obsolete monitorreactions db entries
const monitorreactions = new nedb('./data/monitorreactions.db')
monitorreactions.loadDatabase((err) => { //needs to be loaded with each iteration so that changes get loaded
    if (err) return logger("error", "controller.js", "Error loading timedbans database: " + err) 

    monitorreactions.remove({ until: { $lte: Date.now() } }, {}, (err, num) => { //until is a date in ms, so we remove all entries that are greater than right now
        if (err) logger("error", "controller.js", `Error removing all monitorreactions entries that are greater than ${Date.now()}: ${err}`, true) 
        if (num > 0) { 
            logger("info", "controller.js", `Cleaned up monitorreactions db and removed ${num} entries!`, true)
            monitorreactions.persistence.compactDatafile() } }) //compact db so that the starting bot instances don't read old data
});

//Game rotation
if (config.gamerotateseconds <= 10) logger("warn", "controller.js", "gamerotateseconds in config is <= 10 seconds! Please increase this value to avoid possible cooldown errors/API spamming!", true)
if (config.gameurl == "") logger("warn", "controller.js", "gameurl in config is empty and will break the bots presence!", true)
let currentgameindex = 0
let lastPresenceChange = Date.now() //this is useful because intervals can get very unprecise over time

var gamerotationloop = setInterval(() => {
    if (lastPresenceChange + (config.gamerotateseconds * 1000) > Date.now()) return; //last change is more recent than gamerotateseconds wants

    //Refresh config cache to check if gameoverwrite got changed
    delete require.cache[require.resolve("./config.json")]
    config = require("./config.json")

    if (config.gameoverwrite != "" || (new Date().getDate() == 1 && new Date().getMonth() == 0)) { //if botowner set a game manually then only change game if the instance isn't already playing it
        let game = config.gameoverwrite
        if (new Date().getDate() == 1 && new Date().getMonth() == 0) game = `Happy Birthday beepBot!`

        Manager.broadcastEval(`
        if (this.user.presence.activities[0].name != "${game}") {
            this.user.setPresence({activity: { name: "${game}", type: "${config.gametype}", url: "${config.gameurl}" }, status: "${config.status}" }) }`).catch(err => { //error will occur when not all shards are started yet
            logger("warn", "controller.js", "Couldn't broadcast setPresence: " + err.stack) })

        currentgameindex = 0; //reset gameindex
        lastPresenceChange = Date.now() + 600000 //add 10 min to reduce load a bit
        return; } //don't change anything else if botowner set a game manually

    currentgameindex++ //set here already so we can't get stuck at one index should an error occur
    if (currentgameindex == config.gamerotation.length) currentgameindex = 0 //reset
    lastPresenceChange = Date.now()

    //Replace code in string (${})
    function processThisGame(thisgame, callback) {
        try {
            let matches = thisgame.match(/(?<=\${\s*).*?(?=\s*})/gs) //matches will be everything in between a "${" and "}" -> either null or array with results

            if (matches) {
                matches.forEach(async (e, i) => {
                    let evaled = await eval(matches[i])
                    thisgame = thisgame.replace(`\${${e}}`, evaled)

                    if (!thisgame.includes("${")) callback(thisgame)
                })
            } else {
                callback(thisgame) } //nothing to process, callback unprocessed argument
        
        } catch(err) {
            logger("warn", "controller.js", `Couldn't replace gamerotation[${currentgameindex}] in gamerotationloop. Error: ${err.stack}`)
            return; } }

    processThisGame(config.gamerotation[currentgameindex], callback => {
        lastPresenceChange = Date.now() //set again to include processing time

        Manager.broadcastEval(`this.user.setPresence({activity: { name: "${callback}", type: "${config.gametype}", url: "${config.gameurl}" }, status: "${config.status}" })`).catch(err => { //error will occur when not all shards are started yet
            return logger("warn", "controller.js", "Couldn't broadcast setPresence: " + err.stack) }) })
}, 5000)

//Unban checker
const timedbans = new nedb('./data/timedbans.db') //initialise database
    
let lastTempBanCheck = Date.now() //this is useful because intervals can get unprecise over time
var tempbanloop = setInterval(() => {
    if (lastTempBanCheck + 10000 > Date.now()) return; //last check is more recent than 10 seconds

    timedbans.loadDatabase((err) => { //needs to be loaded with each iteration so that changes get loaded
        if (err) return logger("warn", "controller.js", "Error loading timedbans database: " + err) });

    timedbans.find({ until: { $lte: Date.now() } }, (err, docs) => { //until is a date in ms, so we check if it is less than right now
        if (docs.length < 1) return; //nothing found

        docs.forEach((e, i) => { //take action for all results
            Manager.broadcastEval(`
                let guild = this.guilds.cache.get("${e.guildid}")
                if (guild) {
                    //Add ids as fallback option for msgtomodlogchannel
                    var authorobj = guild.members.cache.get("${e.authorid}") //try to populate obj with actual data
                    var recieverobj = guild.members.cache.get("${e.userid}")

                    if (!authorobj) authorobj = {} //set blank if check failed
                    if (!recieverobj) recieverobj = {}
                    authorobj["userid"] = ${e.authorid} //add id as fallback should getting actual data failed
                    recieverobj["userid"] = ${e.userid}

                    this.timedbans.remove({$and: [{ userid: "${e.userid}" }, { guildid: "${e.guildid}" }] }, (err => { if (err) logger("error", "controller.js", "Error removing ${e.userid} from timedbans: " + err) }))

                    guild.members.unban("${e.userid}")
                        .then(res => {
                            if (Object.keys(res).length > 1) recieverobj = res //overwrite recieverobj if we actually have data from the unban response

                            this.fn.msgtomodlogchannel(guild, "unban", authorobj, recieverobj, ["${e.banreason}"]) })
                        .catch(err => {
                            if (err != "DiscordAPIError: Unknown Ban") return this.fn.msgtomodlogchannel(guild, "unbanerr", authorobj, recieverobj, ["${e.banreason}", err]) }) //if unknown ban ignore, user has already been unbanned
                }
            `).catch(err => {
                logger("warn", "controller.js", "Couldn't broadcast unban: " + err.stack)
                if (err == "Error [SHARDING_IN_PROCESS]: Shards are still being spawned") return; }) //do not remove from db when shards are being spawned
        })
    })
}, 5000); //5 seconds

//Unmute checker
const timedmutes = new nedb('./data/timedmutes.db') //initialise database
    
let lastTempMuteCheck = Date.now() //this is useful because intervals can get unprecise over time
var timedmuteloop = setInterval(() => {
    if (lastTempMuteCheck + 10000 > Date.now()) return; //last check is more recent than 10 seconds

    timedmutes.loadDatabase((err) => { //needs to be loaded with each iteration so that changes get loaded
        if (err) return logger("warn", "controller.js", "Error loading timedbans database: " + err) });

    timedmutes.find({ until: { $lte: Date.now() } }, (err, docs) => { //until is a date in ms, so we check if it is less than right now
        if (docs.length < 1) return; //nothing found

        docs.forEach((e, i) => { //take action for all results
            if (e.type != "tempmute") return; //only handle mutes that are temporary and should result in a unmute

            Manager.broadcastEval(`
                let guild = this.guilds.cache.get("${e.guildid}")
                if (guild) {
                    //Add ids as fallback option for msgtomodlogchannel
                    var authorobj = guild.members.cache.get("${e.authorid}").user //try to populate obj with actual data
                    var recieverobj = guild.members.cache.get("${e.userid}").user

                    if (!authorobj) authorobj = {} //set blank if check failed
                    if (!recieverobj) recieverobj = {}
                    authorobj["userid"] = ${e.authorid} //add id as fallback should getting actual data failed
                    recieverobj["userid"] = ${e.userid}

                    if ("${e.where}" == "chat" || "${e.where}" == "all") { //user was muted in chat
                        let mutedrole = guild.roles.cache.find(role => role.name == "beepBot Muted")
                        if (!mutedrole) return; //role was deleted as it seems so user can't have it anymore anyway

                        //Remove role
                        guild.members.cache.get("${e.userid}").roles.remove()
                            .catch(err => { //catch error of role adding
                                return this.fn.msgtomodlogchannel(guild, "unmuteerr", authorobj, recieverobj, ["${e.mutereason}", err]) }) }
                    
                    //remove matching userid and guildid entries from db now so that voiceStateUpdate won't attack
                    this.timedmutes.remove({$and: [{ userid: "${e.userid}" }, { guildid: "${e.guildid}" }]}, (err => { if (err) this.fn.logger("error", "controller.js", "Error removing ${e.userid} from timedmutes: " + err) }))
                
                    if ("${e.where}" == "voice" || "${e.where}" == "all") { //user was banned in voice
                        //Remove voice mute
                        if (guild.members.cache.get("${e.userid}").voice.channel != null) { 
                            guild.members.cache.get("${e.userid}").voice.setMute(false)
                                .catch(err => {
                                    return this.fn.msgtomodlogchannel(guild, "unmuteerr", authorobj, recieverobj, ["${e.mutereason}", err]) }) 
                        } else {
                            //if the user can't be unmuted right now push it into the db and handle it with the voiceStateUpdate event
                            let unmuteobj = {
                                type: "unmute", //used to determine what action to take by the voiceStateUpdate event if the user can't be muted right now
                                userid: "${e.userid}",
                                where: "voice",
                                guildid: "${e.guildid}",
                                authorid: "${e.authorid}",
                                mutereason: "${e.mutereason}"
                            }
                            
                            this.timedmutes.insert(unmuteobj, (err) => { if (err) this.fn.logger("error", "controller.js", "error updating db: " + err) }) //insert new obj instead of updating old one so that the db remove call won't remove it
                        }
                    }

                    this.fn.msgtomodlogchannel(guild, "unmute", authorobj, recieverobj, ["auto", "${e.mutereason}"])
                }
            `).catch(err => {
                if (err == "Error [SHARDING_IN_PROCESS]: Shards are still being spawned") return;
                logger("warn", "controller.js", "Couldn't broadcast unmute: " + err.stack) }) 
        })
    })
}, 5000); //5 seconds

//X-mas avatar checker
if (config.loginmode == "normal") {
    let lastxmascheck = Date.now() - 21600000 //subtract 6 hours so that the first interval will already get executed
    var currentavatar = ""

    function checkavatar() {
        if (new Date().getMonth() == "11") { //if month is December (getMonth counts from 0)
            if (currentavatar == "xmas") return; //seems to be already set to xmas
            
            Manager.broadcastEval(`this.user.setAvatar("${constants.botxmasavatar}")`)
                .then(() => { 
                    logger("info", "controller.js", "Successfully changed avatar to xmas."); 
                    currentavatar = "xmas" //change to xmas so that the check won't run again
                    lastxmascheck = Date.now() })
                .catch((err) => { //don't set currentavatar so that the check will run again
                    logger("warn", "controller.js", "Couldn't broadcast xmas avatar change: " + err.stack) 
                    lastxmascheck = Date.now() - 19800000 //subtract 5.5 hours so that the next check will run in half an hour
                    return; })
        } else {
            if (currentavatar == "normal") return; //seems to be already set to normal

            Manager.broadcastEval(`this.user.setAvatar("${constants.botdefaultavatar}")`)
                .then(() => { 
                    logger("info", "controller.js", "Successfully changed avatar to normal."); 
                    currentavatar = "normal" //change to normal so that the check won't run again
                    lastxmascheck = Date.now() })
                .catch((err) => { //don't set currentavatar so that the check will run again
                    logger("warn", "controller.js", "Couldn't broadcast normal avatar change: " + err.stack) 
                    lastxmascheck = Date.now() - 19800000 //subtract 5.5 hours so that the next check will run in half an hour
                    return; })
        } }

    var xmasloop = setInterval(() => {
        if (lastxmascheck + 21600000 > Date.now()) return; //last change is more recent than 6 hours
        checkavatar()
    }, 60000) } //60 seconds