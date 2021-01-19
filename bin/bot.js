//This file controls one shard
var bootstart   = 0;
var bootstart   = new Date()
const shardArgs = process.argv //eslint-disable-line no-unused-vars

const Discord  = require("discord.js")
const readline = require("readline")
const path     = require("path")
const nedb     = require("nedb")
const fs       = require("fs")

const configpath = "./config.json"
const config     = require(configpath)
const constants  = require("./constants.json")

const bot = new Discord.Client()
var   fn  = {} //object that will contain all functions to be accessible from commands

bot.config    = config //I'm just gonna add it to the bot object as quite a few cmds will probably need the config later on
bot.constants = constants

/* ------------ Functions for all shards: ------------ */
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
    var filler1 = ""
    var filler2 = ""
    var filler3 = ""

    if (typestr != "" || originstr != "") { 
        filler1 = "["
        filler3 = "\x1b[0m] " }

    if (typestr != "" && originstr != "") {
        filler2 = " | " }

    //Put it together
    var string = `${filler1}${typestr}${filler2}${originstr}${filler3}${date}${str}`

    //Print message with remove or without
    if (remove) {
        readline.clearLine(process.stdout, 0) //0 clears entire line
        process.stdout.write(`${string}\r`)
    } else {
        readline.clearLine(process.stdout, 0)
        console.log(`${string}`) }

    //eslint-disable-next-line
    fs.appendFileSync('./output.txt', string.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '') + '\n', err => { //Regex Credit: https://github.com/Filirom1/stripcolorcodes
        if(err) console.log('logger function appendFileSync error: ' + err) }) 

    return string; } //Return String, maybe it is useful for the calling file

/**
* Returns the language obj the specified server has set
* @param {Number} guildid The id of the guild
* @returns {Object} lang object callback
*/
var lang = (guildid, guildsettings) => {
    if (!guildid) { logger('error', 'bot.js', "function lang: guildid not specified!"); return; }

    if (!guildsettings) var serverlang = constants.defaultguildsettings.lang
        else var serverlang = guildsettings.lang
    
    if (!Object.keys(bot.langObj).includes(serverlang)) {
        logger("warn", "bot.js", `Guild ${guildid} has an invalid language! Returning english language...`)
        return bot.langObj["english"] }
    
    return bot.langObj[serverlang]
}

/**
 * Adds the specified guild to the settings database with default values
 * @param {Object} guild The message.guild object
 * @param {Boolean} removeentry Removes the guild from the database
 */
var servertosettings = (guild, removeentry) => {
    if (!guild.id) return logger("error", "bot.js", "Can't write guild to settings because guild id is undefined!"); //missing guildid will make entry unuseable

    //if removeentry is true just remove entry and stop further execution
    if (removeentry) {
        logger("info", "bot.js", `removeentry: Removing ${guild.id} from settings database...`, false, true)
        settings.remove({ guildid: guild.id }, (err) => { if (err) logger("error", "bot.js", `servertosettings error removing guild ${guild.id}: ${err}`)
        return; }) }

    settings.findOne({ guildid: guild.id }, (err, data) => {
        //adding prefix to server nickname
        if (guild.members.cache.get(bot.user.id).nickname === null) { //bot has no nickname, start nickname with username
            var nickname = bot.user.username
        } else {
            if (!data || !data.prefix) var nickname = guild.members.cache.get(String(bot.user.id).nickname) //get nickname without trying to replace old prefix if server has no entry in settings.json yet
                else var nickname = guild.members.cache.get(String(bot.user.id)).nickname.replace(` [${data.prefix}]`, "") }

        if (config.loginmode == "normal") var prefix = constants.DEFAULTPREFIX
            else var prefix = constants.DEFAULTTESTPREFIX
        
        if (nickname == undefined) var nickname = bot.user.username //since nickname can still somehow be undefined check one last time
        guild.members.cache.get(String(bot.user.id)).setNickname(`${nickname} [${prefix}]`).catch(() => {}) //catch error but ignore it

        let defaultguildsettings = constants.defaultguildsettings
        defaultguildsettings["guildid"] = guild.id
        defaultguildsettings["prefix"] = prefix

        logger("info", "bot.js", `Adding ${guild.id} to settings database with default settings...`, false, true)
        if (data) settings.remove({ guildid: guild.id }, (err) => { if (err) logger("error", "bot.js", `servertosettings error removing guild ${guild.id}: ${err}`) })
        settings.insert(defaultguildsettings, (err) => { if (err) logger("error", "bot.js", "servertosettings error inserting guild: " + err) })
    })
}

/**
 * Attempts to get a user object from a message
 * @param {Object} message The message object
 * @param {Array} args The args array
 * @param {Boolean} allowauthorreturn Specifies if the function should return the author if no args is given
 * @returns {Object} The retrieved user object
 */
var getuserfrommsg = (message, args, allowauthorreturn) => {
    if (!args[0] && allowauthorreturn) return message.author
    else if (message.guild.members.cache.find(member => member.user.username == args[0])) return message.guild.members.cache.find(member => member.user.username == args[0]).user
    else if (message.guild.members.cache.find(member => member.nickname == args[0])) return message.guild.members.cache.find(member => member.nickname == args[0]).user
    else if (message.guild.members.cache.get(args[0])) return message.guild.members.cache.get(args[0]).user
    else if (message.mentions.users.first()) return message.mentions.users.first()
    else return {} }

/**
 * Attempts to get time from message and converts it into ms
 * @param {Array} args The args array
 * @returns {Number} time in ms
 * @returns {Number} index of time unit in lang.general.gettimefuncoptions
 * @returns {Array} Array containing amount and unit. Example: ["2", "minutes"]
 */
var gettimefrommsg = (args, callback) => {
    var arr = []
    if (args.includes("-t")) {
        arr = [args[args.indexOf("-t") + 1], args[args.indexOf("-t") + 2]] //Result example: ["2", "minutes"]
    } else if (args.includes("-time")) {
        arr = [args[args.indexOf("-time") + 1], args[args.indexOf("-time") + 2]] //Result example: ["2", "minutes"]
    } else callback(null, null, []) //nothing found

    switch (arr[1]) {
        case "second":
        case "seconds":
            callback(arr[0] * 1000, 0, arr)
            break;
        case "minute":
        case "minutes":
            callback(arr[0] * 60000, 1, arr)
            break;
        case "hour":
        case "hours":
            callback(arr[0] * 3600000, 2, arr)
            break;
        case "day":
        case "days":
            callback(arr[0] * 86400000, 3, arr)
            break;
        case "month":
        case "months":
            callback(arr[0] * 2629800000, 4, arr)
            break;
        case "year":
        case "years":
            callback(arr[0] * 31557600000, 5, arr)
            break;
        default:
            callback(null, null, arr)
    } }

/**
 * Sends a message to the modlogchannel of that guild if it has one set
 * @param {Discord.Guild} guild The guild obj
 * @param {String} action Type of action (valid: clear, kick, ban, unban, movemsg)
 * @param {Discord.User} author Initiator of the action
 * @param {Discord.User} reciever The affected user of the action 
 * @param {Array<String>} details Additional details
 */
var msgtomodlogchannel = (guild, action, author, reciever, details) => {
    settings.findOne({ guildid: guild.id }, (err, guildsettings) => {
        if (guildsettings.modlogfeatures && !guildsettings.modlogfeatures.includes(action) && !action.includes("err")) return; //user turned off this modlogfeature and it isn't an err

        if (!guildsettings || !guildsettings.modlogchannel || action == "modlogmsgerr") { //if modlogchannel is undefined (turned off) or a previous modlogmsg failed
            if (action.includes("err")) { //if error, then find a channel to inform someone
                if (guildsettings.systemchannel && action != "modlogmsgerr") guildsettings.modlogchannel = guildsettings.systemchannel //if no modlogchannel set, try systemchannel
                    else if (guild.systemChannelID && action != "modlogmsgerr") guildsettings.modlogchannel = guild.systemChannelID //then check if guild has a systemChannel set
                    else {
                        //well then try and get the first channel (rawPosition) where the bot has permissions to send a message
                        guildsettings.modlogchannel = null //better set it to null to avoid potential problems

                        //get all text channels into array and sort them by ascending rawPositions
                        let textchannels = guild.channels.cache.filter(c => c.type == "text").sort((a, b) => a.rawPosition - b.rawPosition)
                        guildsettings.modlogchannel = textchannels.find(c => c.permissionsFor(bot.user).has("SEND_MESSAGES")).id //find the first channel with perms
                        if (!guildsettings.modlogchannel) return; } //if it couldn't find a channel then stop
                
                if (!guildsettings || !guildsettings.lang) guildsettings.lang = constants.defaultguildsettings.lang //set default lang to suppress error from lang function
            } else { return; } } //yes well if it isn't an error then stop

        let guildlang = lang(guild.id, guildsettings)

        //Avoid errors from controller.js unban broadcastEval
        if (!author["username"]) author["username"] = "ID: " + author.userid //userid will always be defined (look at controller.js unban broadcastEval)
        if (!author["discriminator"]) author["discriminator"] = "????"
        if (!reciever["username"]) reciever["username"] = "ID: " + reciever.userid
        if (!reciever["discriminator"]) reciever["discriminator"] = "????"

        var msg = {embed:{
            title: "",
            color: null,
            fields: [],
            footer: { icon_url: bot.user.displayAvatarURL(), text: guildlang.general.modlogdeletewithreaction }
        }}

        switch (action) {
            case "clear":
                msg.embed.title = guildlang.general.modlogcleartitle.replace("author", `${author.username}#${author.discriminator}`).replace("clearamount", details[0]).replace("channelname", "#" + details[1].name)
                msg.embed.color = 16753920 //orange
                break;
            case "kick":
                msg.embed.title = guildlang.general.modlogkicktitle.replace("author", `${author.username}#${author.discriminator}`).replace("reciever", `${reciever.username}#${reciever.discriminator}`)
                msg.embed.color = 16753920 //orange
                msg.embed.fields.push({ name: `${guildlang.general.reason}:`, value: details[0] })
                msg.embed.fields.push({ name: `${guildlang.general.details}:`, value: guildlang.general.modloguserwasnotified + String(details[1]).replace("true", "✅").replace("false", "❌") }) //details[1] is a boolean if the user was notified
                break;
            case "ban":
                msg.embed.title = guildlang.general.modlogbantitle.replace("author", `${author.username}#${author.discriminator}`).replace("reciever", `${reciever.username}#${reciever.discriminator}`)
                msg.embed.color = 16711680 //red
                msg.embed.fields.push({ name: `${guildlang.general.reason}:`, value: details[0] })
                msg.embed.fields.push({ name: `${guildlang.general.details}:`, 
                                        value: `${guildlang.general.banlength}${details[1]}
                                                ${guildlang.general.modloguserwasnotified}${String(details[2]).replace("true", "✅").replace("false", "❌")}` 
                                    })
                break;
            case "unban":
                msg.embed.title = guildlang.general.modlogunbantitle.replace("reciever", `${reciever.username}#${reciever.discriminator}`)
                msg.embed.color = 65280 //green
                msg.embed.fields.push({ name: `${guildlang.general.reason}:`, value: details[0] })
                break;
            case "unbanerr":
                msg.embed.title = guildlang.general.modlogunbanerrtitle.replace("reciever", `${reciever.username}#${reciever.discriminator}`)
                msg.embed.color = 14725921 //some orange mixture
                msg.embed.fields.push({ name: `${guildlang.general.error}:`, value: details[1] })
                msg.embed.fields.push({ name: `${guildlang.general.reason}:`, value: details[0] })
                break;
            case "movemsg":
                msg.embed.title = guildlang.general.modlogmovemsgtitle.replace("author", `${author.username}#${author.discriminator}`).replace("reciever", `${reciever.username}#${reciever.discriminator}`)
                msg.embed.color = 65280 //green
                msg.embed.fields.push({ name: `${guildlang.general.modlogmovemsgcontent}:`, value: details[0] })
                msg.embed.fields.push({ name: `${guildlang.general.reason}:`, value: details[2] })
                msg["files"] = details[1] //add attachments array
                break;
            case "modlogmsgerr":
                msg.embed.title = guildlang.general.modlogmsgerrtitle
                msg.embed.color = 16711680 //red
                msg.embed.fields.push({ name: `${guildlang.general.error}:`, value: details[0] })
                msg.embed.fields.push({ name: `${guildlang.general.message}:`, value: details[1] })
                break;
            default:
                return logger("error", "bot.js", "msgtomodlogchannel unsupported action: " + action);
        }

        if (!guild.members.cache.get(bot.user.id).permissions.has("ADD_REACTIONS")) msg.embed.footer.text = guildlang.general.modlognoaddreactionsperm //change footer text

        guild.channels.cache.get(guildsettings.modlogchannel).send(msg)
            .then((msg) => { //don't need to ask shard manager
                msg.react("🗑️") //doesn't work yet
                    .then(res => { 
                        //add res to monitorreactions db
                        monitorreactions.insert({ type: "modlog", msg: res.message.id, reaction: res._emoji.name, guildid: guild.id, allowedroles: guildsettings.adminroles, until: Date.now() + 31557600000 }, (err) => { if (err) logger("error", "bot.js", "Error inserting modlogmsg reaction to db: " + err) }) //message also contains guild and timestamp | 31557600000 ms = 12 months
                    })
                    .catch(() => {}) }) //reaction err catch -> ignore error
            .catch((err) => { //sendmsg error catch
                console.log(err)
                if (err) return msgtomodlogchannel(guild, "modlogmsgerr", author, reciever, [err, msg.embed.title]) }) //call this same function again to notify that modlogmsgs can't be sent (won't end in a loop because if no channel can be found on err then it will stop)

    })
}

/**
 * Rounds a number with x decimals
 * @param {Number} value Number to round 
 * @param {Number} decimals Amount of decimals
 * @returns {Number} Rounded number
 */
var round = (value, decimals) => {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals) }

/**
 * Returns random hex value
 * @returns {Number} Hex value
 */
var randomhex = () => {
    return Math.floor(Math.random() * 16777214) + 1 }

/**
 * Returns a random String from an array
 * @param {Array<String>} arr An Array with Strings to choose from
 * @returns {String} A random String from the provided array
 */
var randomstring = arr => arr[Math.floor(Math.random() * arr.length)]

var owneronlyerror = (lang) => { return randomstring(lang.general.owneronlyerror) + " (Bot Owner only-Error)" }
var usermissperm   = (lang) => { return randomstring(lang.general.usermissperm) + " (Role permission-Error)" }


/* -------------- Command reader -------------- */
bot.commands = new Discord.Collection()

var commandcount = 0;
const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())

dirs('./bin/commands').forEach((k) => {
    fs.readdir(`./bin/commands/${k}`, (err, files) => {
        if (err) logger('error', 'bot.js', err);
        var jsfiles = files.filter(p => p.split('.').pop() === 'js');
        
        jsfiles.forEach((f) => {
            var cmd = require(`./commands/${k}/${f}`);

            for(let j = 0; j < cmd.info.names.length; j++) { //get all aliases of each command
                var tempcmd = JSON.parse(JSON.stringify(cmd)) //Yes, this practice of a deep copy is probably bad but everything else also modified other Collection entries and I sat at this problem for 3 fucking hours now
                tempcmd["run"] = cmd.run //Add command code to new deep copy because that got lost somehow
                tempcmd.info.category = k

                if (bot.commands.get(tempcmd.info.names[j])) return logger("warn", "bot.js", `Duplicate command name found! Command: ${tempcmd.info.names[j]}`, true)

                if (j != 0) tempcmd.info.thisisanalias = true //seems like this is an alias
                    else { 
                        commandcount++
                        tempcmd.info.thisisanalias = false }

                bot.commands.set(tempcmd.info.names[j], tempcmd) }
        })
    })
})

/* -------------- Create lang object -------------- */
/**
 * Function to construct the language object
 * @param {String} dir Language Folder Root Path
 */
function langFiles(dir) { //Idea from https://stackoverflow.com/a/63111390/12934162
    fs.readdirSync(dir).forEach(file => {
        const absolute = path.join(dir, file);
        if (fs.statSync(absolute).isDirectory()) return langFiles(absolute);
        else {
            if (!file.includes(".json")) return; //ignore all files that aren't .json
            let result = absolute.replace(".json", "").replace(/\\/g, '/').split("/") //remove file ending, convert windows \ to unix / and split path into array

            result.splice(0, 2); //remove "bin" and "lang"
            result.splice(2, 1); //remove category name

            if (!bot.langObj[result[0]]) bot.langObj[result[0]] = {} //create language key
            if (!bot.langObj[result[0]]["cmd"]) bot.langObj[result[0]]["cmd"] = {} //create cmd key

            try {
                if (result[1] == "commands") {
                    bot.langObj[result[0]]["cmd"][result[2]] = require(absolute.replace("bin", "."))
                } else {
                    bot.langObj[result[0]][result[1]] = require(absolute.replace("bin", ".")) }
            } catch(err) {
                if (err) logger("warn", "bot.js", `langFiles function: lang ${result[0]} has an invalid file: ${err}`) }
            
            return; }
    }) }

bot.langObj = {}
langFiles("./bin/lang/"); //RECURSION TIME!


//Add functions to fn object
fn = { logger, lang, servertosettings, getuserfrommsg, gettimefrommsg, msgtomodlogchannel, round, randomhex, randomstring, owneronlyerror, usermissperm }
bot.fn = fn //I need to be able to access functions from the sharding manager

process.on('unhandledRejection', (reason) => {
    logger('error', 'bot.js', `Unhandled Rejection! Reason: ${reason.stack}`) });

process.on('uncaughtException', (reason) => {
    logger('error', 'bot.js', `Uncaught Exception! Reason: ${reason.stack}`) });


/* -------------- Load databases -------------- */
const settings = new nedb('./data/settings.db') //initialise database
settings.loadDatabase((err) => {
    if (err) return logger("error", "bot.js", "Error loading settings database. Error: " + err)
    logger("info", "bot.js", "Successfully loaded settings database.", false, true) }); //load db content into memory
bot.settings = settings; //add reference to bot obj

const timedbans = new nedb('./data/timedbans.db') //initialise database
timedbans.loadDatabase((err) => {
    if (err) return logger("error", "bot.js", "Error loading timedbans database. Error: " + err)
    logger("info", "bot.js", "Successfully loaded timedbans database.", false, true) }); //load db content into memory
bot.timedbans = timedbans; //add reference to bot obj

const monitorreactions = new nedb('./data/monitorreactions.db') //initialise database
monitorreactions.loadDatabase((err) => {
    if (err) return logger("error", "bot.js", "Error loading monitorreactions database. Error: " + err)
    logger("info", "bot.js", "Successfully loaded monitorreactions database.", false, true) }); //load db content into memory

/* ------------ Startup: ------------ */
bot.on("ready", async function() {
    if (bot.guilds.cache.array()[0] == undefined) return logger("warn", "bot.js", "This shard has no guilds and is therefore unused!");
    var thisshard = bot.guilds.cache.array()[0].shard //Get shard instance of this shard with this "workaround" because it isn't directly accessable

    //Set activity either to gameoverwrite or gamerotation[0]
    if (config.gameoverwrite != "" || (new Date().getDate() == 1 && new Date().getMonth() == 0)) { 
        let game = config.gameoverwrite
        if (new Date().getDate() == 1 && new Date().getMonth() == 0) game = `Happy Birthday beepBot!`

        bot.user.setPresence({activity: { name: game, type: config.gametype, url: config.gameurl }, status: config.status }).catch(err => { return logger("", "", "Woops! Couldn't set presence: " + err); })
    } else bot.user.setPresence({activity: { name: config.gamerotation[0], type: config.gametype, url: config.gameurl }, status: config.status }).catch(err => { return logger("", "", "Woops! Couldn't set presence: " + err); })

    if (thisshard.id == 0) {
        //Finish startup messages from controller.js
        logger("", "", `> ${commandcount} commands & ${Object.keys(bot.langObj).length} languages found!`)
        logger("", "", "> Successfully logged in shard0!")
        logger("", "", "*--------------------------------------------------------------*\n ", true) }

    bot.commandcount = commandcount //probably useful for a few cmds so lets just add it to the bot obj (export here so the read process is definitely finished)
    
    setTimeout(() => {
        logger("", "", "", true, true) //Print empty line to clear other stuff
    }, 2500);
});

/* ------------ Event Handlers: ------------ */
bot.on("guildCreate", guild => {
    servertosettings(bot, guild)
    logger('info', 'bot.js', `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount-1} other members!`)
    
    //welcome message mit help link und settings setup aufforderung
})

bot.on("guildDelete", async guild => {
    bot.shard.fetchClientValues("guilds.cache.size").then(res => { //wait for promise
        logger('info', 'bot.js', `I have been removed from: ${guild.name} (${guild.id}). I'm now in ${res} servers.`) })

    servertosettings(guild.id, true) }); //true argument will remove function from db

bot.on("guildMemberAdd", member => {
    //take care of greetmsg
    settings.findOne({ guildid: member.guild.id }, (err, guildsettings) => {
        if (guildsettings.systemchannel && guildsettings.greetmsg) {
            //check settings.json for greetmsg, replace username and servername and send it into setting's systemchannel
            let msgtosend = guildsettings.greetmsg

            if (msgtosend.includes("@username")) msgtosend = msgtosend.replace("@username", `<@${member.user.id}>`)
                else msgtosend = msgtosend.replace("username", member.user.username)
            msgtosend = msgtosend.replace("servername", member.guild.name)

            member.guild.channels.cache.get(String(guildsettings.systemchannel)).send(msgtosend) }

        //take care of memberaddrole
        if (guildsettings.memberaddroles.length > 0) {
            member.roles.add(guildsettings.memberaddroles) } //add all roles at once (memberaddroles is an array)
    })
    
});

bot.on("guildMemberRemove", member => {
    settings.findOne({ guildid: member.guild.id }, (err, guildsettings) => {
        if (!guildsettings.systemchannel) return;
        if (!guildsettings.byemsg) return;

        let msgtosend = String(guildsettings.byemsg)
        msgtosend = msgtosend.replace("username", member.user.username)
        msgtosend = msgtosend.replace("servername", member.guild.name)

        member.guild.channels.cache.get(String(guildsettings.systemchannel)).send(msgtosend)
    })
})

bot.on("messageReactionAdd", (reaction, user) => {
    monitorreactions.findOne({ reaction: reaction._emoji.name }, (err, doc) => {
        if (!doc) return;
        if (err) return logger("error", "bot.js", "messageReactionAdd Event: Error searching in db: " + err)
        
        switch (doc.type) {
            case "modlog":
                if (doc.allowedroles.filter(element => reaction.message.guild.members.cache.get(user.id).roles.cache.has(element)).length > 0 || user.id == reaction.message.guild.owner.id) { //either user has role or is owner of guild
                    reaction.message.delete()
                        .then(() => {
                            monitorreactions.remove({ reaction: reaction._emoji.name }, {}, (err) => { 
                                if (err) logger("error", "bot.js", `messageReactionAdd Event: Error removing ${reaction._emoji.name} from db after deleting msg: ${err}`) })
                            return; })
                        .catch(err => { reaction.message.channel.send(`Error deleting message: ${err}`) }) 
                } else return;
                break;
            default:
                return logger("error", "bot.js", "Invalid monitorreactions type in db! Fix this please: " + doc.type);
        }
    })
})

/* ------------ Message Handler: ------------ */
bot.on('message', (message) => {
    if (message.author.bot) return;
    if (message.channel.type == "text") var thisshard = message.guild.shard //Get shard instance of this shard with this "workaround" because it isn't directly accessabl
        else var thisshard = 0 //set shard id to 0 to prevent errors for example when texting in DM

    //if (message.guild.id != "232550371191554051" && message.guild.id != "331822220051611648") return; //don't respond to other guilds when testing with normal loginmode (for testing)
    if (message.channel.type == "text" && config.loginmode == "test") logger("info", "bot.js", `Shard ${thisshard.id}: ${message}`) //log messages when testing

    //Confuse the db searching into finding nothing but not throwing an error when the channel is a dm
    if (message.channel.type == "dm") var guildid = 0 //yes this isn't best practice but probably saves me from restructuring the code
        else var guildid = message.guild.id

    settings.findOne({ guildid: guildid }, (err, guildsettings) => { //fetch guild data once and pass it with run function
        if (err) {
            logger("error", "bot.js", "msg Event: Error fetching guild from database: " + err)
            message.channel.send("Something went wrong getting your guild's settings from the database. Please try again later.")
            return; }

        //Check if guild is in settings db and add it if it isn't
        if (message.channel.type !== "dm") {
            if (!guildsettings) {
                servertosettings(message.guild)
        
                //quickly construct guildsettings object to be able to carry on
                if (config.loginmode == "normal") var prefix = constants.DEFAULTPREFIX
                    else var prefix = constants.DEFAULTTESTPREFIX

                guildsettings = constants.defaultguildsettings
                guildsettings["guildid"] = message.guild.id
                guildsettings["prefix"] = prefix
            } else {
                var changesmade = false
                Object.keys(constants.defaultguildsettings).forEach((e, i) => { //check if this guild's settings is missing a key (update proofing!)
                    if (!Object.keys(guildsettings).includes(e)) { 
                        guildsettings[e] = Object.values(constants.defaultguildsettings)[i]
                        changesmade = true } })
                
                if (changesmade) settings.update({ guildid: message.guild.id }, guildsettings, (err) => { if (err) logger("error", "bot.js", `Error adding missing keys to ${message.guild.id}'s settings db: ${err}`) })
        } }

        //get prefix for this guild or set default prefix if channel is dm
        if (message.channel.type !== "dm") var PREFIX = guildsettings.prefix 
            else { 
                //quickly construct guildsettings object to not cause errors when using in dm
                if (config.loginmode == "normal") var PREFIX = constants.DEFAULTPREFIX
                    else var PREFIX = constants.DEFAULTTESTPREFIX

                guildsettings = constants.defaultguildsettings
                guildsettings["guildid"] = 0
                guildsettings["prefix"] = PREFIX }

        if (message.content.startsWith(PREFIX)) { //check for normal prefix
            var cont = message.content.slice(PREFIX.length).split(" ");
        } else if (message.mentions.users.get(bot.user.id)) { //if no prefix given, check for mention
            var cont = message.content.slice(22).split(" "); //split off the mention <@id>

            if (cont[0] == "") { var cont = cont.slice(1) } //check for space between mention and command
            if (cont.toString().startsWith(PREFIX)) { var cont = cont.toString().slice(PREFIX.length).split(" "); } //the user even added a prefix between mention and cmd? get rid of it.
        } else { //normal message? stop.
            return; }

        if (!cont[0]) return; //message is empty after prefix I guess

        var args = cont.slice(1);
        var cmd  = bot.commands.get(cont[0].toLowerCase());

        if (message.channel.type === "dm") {
            if (cmd && cmd.info.allowedindm === false) return message.channel.send(randomstring(["That cannot work in a dm. :face_palm:","That won't work in a DM...","This command in a DM? No.","Sorry but no. Try it on a server.","You need to be on a server!"]) + " (DM-Error)") }

        if (cmd) { //check if command is existing and run it
            if (cmd.info.nsfwonly == true && !message.channel.nsfw) return message.channel.send(lang(message.guild.id, guildsettings).general.nsfwonlyerror)
            
            var ab = cmd.info.accessableby

            if (!ab.includes("all")) { //check if user is allowed to use this command
                if (ab.includes("botowner")) {
                    if (message.author.id !== '231827708198256642') return message.channel.send(owneronlyerror(lang(message.guild.id)))
                } else if (message.guild.owner && message.author.id == message.guild.owner.id) { //check if owner property is accessible otherwise skip this step. This can be null because of Discord's privacy perms but will definitely be not null should the guild owner be the msg author and only then this step is even of use
                    //nothing to do here, just not returning an error message and let the server owner do what he wants
                } else if (ab.includes("admins")) {
                    if (!guildsettings.adminroles.filter(element => message.member.roles.cache.has(element)).length > 0) return message.channel.send(usermissperm(lang(message.guild.id)))
                } else if (ab.includes("moderators")) {
                    if (!guildsettings.moderatorroles.filter(element => message.member.roles.cache.has(element)).length > 0) return message.channel.send(usermissperm(lang(message.guild.id)))
                } else {
                    message.channel.send(`This command seems to have an invalid restriction setting. I'll have to stop the execution of this command to prevent safety issues.\n${BOTOWNER} will probably see this error and fix it.`) //eslint-disable-line no-undef
                    logger('error', 'bot.js', `The command restriction \x1b[31m'${ab}'\x1b[0m is invalid. Stopping the execution of the command \x1b[31m'${cont[0]}'\x1b[0m to prevent safety issues.`)
                    return;
                }}

            if (message.channel.type === "dm") cmd.run(bot, message, args, bot.langObj["english"], logger, guildsettings, fn)
                else {
                    cmd.run(bot, message, args, lang(message.guild.id, guildsettings), logger, guildsettings, fn) } //run the command after lang function callback
            
            return;
        } else { //cmd not recognized? check if channel is dm and send error message
            if (message.channel.type === "dm") {
                message.channel.send(randomstring(["Invalid command! :neutral_face:","You got something wrong there!","Something is wrong... :thinking:","Whoops - it seems like this command doesn't exists.","Trust me. Something is wrong with your command.","That is not right."]) + " (Wrong command-Error)") }
            return; }
    })
});

setTimeout(() => {
    logger("info", "bot.js", "Logging in...", false, true)
}, 550); //Needs to be slightly longer than controller.js shardCreate timeout
bot.login() //Token is provided by the shard manager