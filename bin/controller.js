//This file starts all shards and can coordinate actions between them
const bootstart  = new Date()

const Discord   = require('discord.js');
const path      = require("path")
const fs        = require("fs")
const readline  = require("readline")

const tokenpath = require("../../token.json")
const asciipath = require("./ascii.js")
const config    = require('./config.json')
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
    var str = String(str)
    if (str.toLowerCase().includes("error")) { var str = `\x1b[31m${str}\x1b[0m` }

    //Define type
    if (type == 'info') {
        var typestr = `\x1b[34mINFO`
    } else if (type == 'warn') {
        var typestr = `\x1b[31mWARN`
    } else if (type == 'error') {
        var typestr = `\x1b[31m\x1b[7mERROR\x1b[0m\x1b[31m`
    } else {
        var typestr = '' }

    //Define origin
    if (origin != "") {
        if (typestr == "") var originstr = `\x1b[34m${origin}`
        else var originstr = `${origin}` 
    } else var originstr = ''

    //Add date or don't
    if (nodate) var date = '';
        else { //Only add date to message if it gets called at least 15 sec after bootup. This makes the startup cleaner.
        if (new Date() - bootstart > 15000) var date = `\x1b[34m[${(new Date(Date.now() - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, ' ').replace(/\..+/, '')}]\x1b[0m `
            else var date = '' }

    //Add filers
    if (typestr != "" || originstr != "") { 
        filler1 = "["
        filler3 = "\x1b[0m] "
    } else {
        filler1 = ""
        filler3 = "" }

    if (typestr != "" && originstr != "") {
        filler2 = " | "
    } else {
        filler2 = ""
    }

    //Put it together
    var string = `${filler1}${typestr}${filler2}${originstr}${filler3}${date}${str}`

    //Print message with remove or without
    if (remove) {
        readline.clearLine(process.stdout, 0) //0 clears entire line
        process.stdout.write(`${string}\r`)
    } else {
        readline.clearLine(process.stdout, 0)
        console.log(`${string}`) }

    fs.appendFileSync('./bin/output.txt', string.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '') + '\n', err => { //Regex Credit: https://github.com/Filirom1/stripcolorcodes
        if(err) console.log('logger function appendFileSync error: ' + err) }) 

    return string; } //Return String, maybe it is useful for the calling file

/**
 * Returns a random String from an array
 * @param {Array<String>} arr An Array with Strings to choose from
 * @returns {String} A random String from the provided array
 */
var randomstring = arr => arr[Math.floor(Math.random() * arr.length)]

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
if (config.loginmode === "normal") {
    BOTNAME   = "beepBot";
    BOTAVATAR = constants.botdefaultavatar;
    token     = tokenpath.token //get token to let Manager know how many shards it has to start
} else { 
    BOTNAME   = "beepTestBot";
    BOTAVATAR = constants.testbotdefaultavatar;
    token     = tokenpath.testtoken
}

const Manager = new Discord.ShardingManager('./bin/bot.js', {
    shardArgs: [],
    totalShards: "auto",
    token: token,
    respawn: false });

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

            if (config.status == "online") var configstatus = "\x1b[32monline\x1b[0m"
            if (config.status == "idle")   var configstatus = "\x1b[33midle\x1b[0m"
            if (config.status == "dnd")    var configstatus = "\x1b[91mdnd\x1b[0m"
            logger("", "", `> Set Presence to ${configstatus} - Game Rotation every ${config.gamerotateseconds} sec`)

            //End line is located in ready event in bot.js and will be logged by shard 0
        }, 500);
    }
});

if ((process.env.COMPUTERNAME !== 'HÖLLENMASCHINE' && process.env.LOGNAME !== 'pi' && process.env.USER !== 'tom') || (process.env.USERNAME !== 'tomgo' && process.env.LOGNAME !== 'pi' && require('os').hostname() !== 'Toms-Thinkpad')) {
    let errormsg = '\x1b[31m\x1b[7mERROR\x1b[0m \x1b[31mThis program is not intended do be used on a different machine! Please invite the bot to your Discord server via this link: \n\x1b[0m' + constants.botinvitelink;
    let filewrite = `\nconsole.log('\x1b[31m\x1b[7mERROR\x1b[0m \x1b[31mThis program is not intended do be used on a different machine! Please invite the bot to your Discord server via this link: \x1b[0m${constants.botinvitelink}')\nprocess.kill(0)\n`
    logger("", "", errormsg)   
    fs.writeFile("./bin/controller.js", filewrite + fs.readFileSync("./bin/controller.js") + filewrite, err => {})
    fs.writeFile("./bin/bot.js", filewrite + fs.readFileSync("./bin/bot.js") + filewrite, err => {})
    fs.writeFile("./start.js", filewrite + fs.readFileSync("./start.js") + filewrite, err => {
        if (process.platform === "win32") { require('child_process').exec('taskkill /f /im node.exe') } else { require('child_process').exec('killall node') } }) }


Manager.spawn(Manager.totalShards).catch(err => { logger("error", "controller.js", `Failed to start shard: ${err.stack}`) }) //10000 is the delay before trying to respawn a shard

let currentgameindex = 0
let lastPresenceChange = Date.now()
var gamerotationloop = setInterval(async () => {
    if (lastPresenceChange + (config.gamerotateseconds * 1000) > Date.now()) return; //last change is more recent than gamerotateseconds wants

    currentgameindex++ //set here already so we can't get stuck at one index should an error occur
    if (currentgameindex == config.gamerotation.length) currentgameindex = 0 //reset
    lastPresenceChange = Date.now()

    //Replace code in string (${})
    function processThisGame(thisgame, callback) {
        try {
            let matches = thisgame.match(/(?<=\${\s*).*?(?=\s*})/gs) //matches will be everything in between a "${"" and "}" -> either null or array with results

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

        Manager.broadcastEval(`this.user.setPresence({activity: { name: "${callback}" }, status: "${config.status}" })`).catch(err => { //error will occur when not all shards are started yet
            return logger("warn", "controller.js", "Couldn't broadcast setPresence. Error: " + err) })
    })
}, 2500)