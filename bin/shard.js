//This file controls one shard

var v         = require("./vars.js");
v.checkm8();
var bootstart = 0;
var bootstart = v.d() //set time for bootup
var logger    = v.logger //make it more simple to interact with it
const ascii   = v.randomstring(v.asciipath.ascii) //set random ascii for this bootup

/* ------------ Initialise startup ------------ */
if (v.config.shards > 1) { logger('info', 'shard.js', "Starting with " + v.config.shards + " shards!") }
logger('info', 'shard.js', `Initiating bootup sequence...`)
logger("", "", `\n${ascii}\n`, true)
logger('info', 'shard.js', "Loading...", true)

if (process.platform == "win32") { //set node process name to find it in task manager etc.
    process.title = `3urobeat's beepBot v${v.config.version} | ${process.platform}` //Windows allows long terminal/process names
} else {
    process.stdout.write(`${String.fromCharCode(27)}]0;3urobeat's beepBot v${v.config.version} | ${process.platform}${String.fromCharCode(7)}`) //sets terminal title (thanks: https://stackoverflow.com/a/30360821/12934162)
    process.title = `beepBot` } //sets process title in task manager etc.

//Log the startup in the cmduse.txt file
v.fs.appendFile("./bin/cmduse.txt", ` \nStarting ${v.config.version} in ${v.config.loginmode} mode. ${v.d()}]\n`, err => {
    if (err) logger('error', 'shard.js', "writing startup to cmduse.txt error: " + err) });

/* ------------ Functions: ------------ */
process.on('unhandledRejection', (reason, p) => {
    logger('error', 'shard.js', `Unhandled Rejection! Reason: ${reason.stack}`) });

function botstartupmode() {
    try {
        logger('info', 'shard.js', 'Logging in...', true)
        if (v.config.loginmode === "normal") {
            v.bot.login(v.tokenpath.token) //login with normal token
            //setting appearance variables:
            BOTNAME   = "beepBot";
            BOTAVATAR = v.botdefaultavatar;
        } else if (v.config.loginmode === "test") {
            v.bot.login(v.tokenpath.testtoken) //login with testbot token
            //setting appearance variables:
            BOTNAME   = "beepTestBot";
            BOTAVATAR = v.testbotdefaultavatar;
        } else {
            logger('error', 'shard.js', "Specified loginmode in config is invalid! Aborting..."); v.bot.destroy(); }
    } catch(err) { logger('error', 'shard.js', "function botstartupmode error logging in: " + err) }}

function avatarinterval(cb) {
    if (v.d().getMonth() == 11) {
        if (v.config.loginmode === "normal") v.bot.user.setUsername(v.BOTXMASNAME).catch(err => { logger('warn', 'shard.js', `XMAS Username error: ${err}`) })
            else v.bot.user.setUsername("beepTestBot").catch(err => { logger('warn', 'shard.js', `(testmode) XMAS Username error: ${err}`) })
        if (v.config.loginmode === "normal") v.bot.user.setAvatar(v.botxmasavatar).catch(err => { logger('warn', 'shard.js', `XMAS Avatar error: ${err}`) })
            else v.bot.user.setAvatar(v.testbotdefaultavatar).catch(err => { logger('warn', 'shard.js', `(testmode) XMAS Avatar error: ${err}`) })
        cb("XMAS");
    } else {
        //v.bot.user.setUsername(BOTNAME).catch(err => { logger('warn', 'shard.js', `Username error: ${err}`) })
        //v.bot.user.setAvatar(BOTAVATAR).catch(err => { logger('warn', 'shard.js', `Avatar error: ${err}`) })
        cb("normal"); }
    lastavatarinterval = Date.now() + (3600000 * 6) }

function updateserverlist() {
    serverlist = []
    v.bot.guilds.cache.array().forEach((e, i) => {
        serverlist.push(e.name + "\n")

        if (i + 1 == v.bot.guilds.cache.array().length) {
            v.fs.writeFile("./bin/serverlist.txt", serverlist.join(""), err => { //join() removes commas from array
                if (err) logger('error', 'shard.js', "function updateserverlist error writing serverlist.txt: " + err) }) } })

    lastserverlistinterval = Date.now() + (1800000) }

var servertosettings = function servertosettings(guild) {
    //adding prefix to server nickname
    if (v.bot.guilds.cache.get(String(guild.id)).members.cache.get(String(v.bot.user.id)).nickname === null) { 
        var nickname = v.bot.user.username 
    } else { 
        var nickname = v.bot.guilds.cache.get(String(guild.id)).members.cache.get(String(v.bot.user.id)).nickname.replace(` [${v.bot.settings[guild.id].prefix}]`, "") }

    if (v.config.loginmode == "test") var prefix = v.DEFAULTTESTPREFIX
        else var prefix = v.DEFAULTPREFIX

    v.bot.guilds.cache.get(String(guild.id)).members.cache.get(String(v.bot.user.id)).setNickname(`${nickname} [${v.DEFAULTPREFIX}]`).catch(err => {})

    v.bot.settings[guild.id] = {
        prefix: prefix,
        lang: "english",
        adminroles: [],
        moderatorroles: [],
        systemchannel: null,
        greetmsg: null,
        byemsg: null,
        memberaddroles: []
    }
    v.fs.writeFile(v.settingspath, JSON.stringify(v.bot.settings, null, 4), err => {
        if(err) logger('error', 'shard.js', `writing server (${guild.id}) to settings.json: ${err}`) }) }

v.bot.servertosettings = servertosettings //exporting function doesn't work because of circular dependency when accessing it from a cmd, so I am just adding it to the bot obj

function cmdusetofile(cmdtype, cont, guildid) {
    v.fs.appendFile("./bin/cmduse.txt",`${cmdtype} ${cont} got used! [${v.d().getHours()}:${v.d().getMinutes()}:${v.d().getSeconds()}] (${guildid})\n`, err => {
        if (err) logger('error', 'shard.js', `writing cmduse to cmduse.txt: ${err}`) }) }


/* ------------ Startup: ------------ */
v.bot.on("ready", async function() {
    logger("", "", "\n*-----------------------------------------------*", true)
    logger("", "", `> Started ${BOTNAME} ${v.config.version} by ${v.BOTOWNER}`, true)
    if (v.config.shards > 1) logger(`> ${v.config.shards} shards running in \x1b[32m${v.config.loginmode}\x1b[0m mode on ${process.platform}`, true); 
        else logger("", "", `> Running in \x1b[32m${v.config.loginmode}\x1b[0m mode on ${process.platform}.`, true);

    v.bot.user.setPresence({activity: { name: v.config.gamerotation[0] }, status: v.config.status }).catch(err => { return logger("", "", "Woops! Couldn't set presence: " + err); })

    let currentgameindex = 1
    var gamerotationloop = setInterval(() => { //interval has a name to be able to clear it (for what ever reason): clearInterval(gamerotationloop)
        v.bot.user.setPresence({activity: { name: v.config.gamerotation[currentgameindex].replace("servercount", v.bot.guilds.cache.size) }, status: v.config.status }).catch(err => { return logger("warn", "shard.js", "Woops! Couldn't set presence: " + err); })
    
        currentgameindex++
        if (currentgameindex == v.config.gamerotation.length) currentgameindex = 0
    }, v.config.gamerotateseconds * 1000)

    //Calls avatarinterval once and then every 6 hours by checking when the last interval happened.
    avatarinterval(function(type) { 
        logger("", "", `> Presence: ${v.config.status} - ${v.config.gamerotation[0]} (${type})`, true) }); //log avatarinterval combined with game, status etc.

    v.bot.setInterval(() => {
        if (Date.now() > lastavatarinterval) {
            avatarinterval(function(type) {
                logger('info', 'shard.js', `Updated name and avatar to ${type}. [${v.d()}]`, true) })}
    }, 30000); //check every 30 seconds

    //serverlist.txt refresh once on startup then every hour:
    updateserverlist();
    v.bot.setInterval(() => {
        if (Date.now() > lastserverlistinterval) {
            updateserverlist();
            //logger('info', 'shard.js', `Updated serverlist.txt. [${v.d()}]`) 
        }
    }, 30000);

    //Command reader:
    const { readdirSync, statSync } = require('fs')
    const { join } = require('path')

    const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())
    cmdssize = 0;

    dirs('./bin/commands').forEach((k, i) => {
        v.fs.readdir(`./bin/commands/${k}`, (err, files) => {
            if (err) logger('error', 'shard.js', err);
            var jsfiles = files.filter(p => p.split('.').pop() === 'js');
            
            jsfiles.forEach((f) => {
                var cmds = require(`./commands/${k}/${f}`);

                for(j = 0; j < Object.keys(cmds.aliases).length; j++) { //get all aliases of each command
                    v.bot.commands.set(Object.values(cmds.aliases)[j], cmds) }
            })
            cmdssize = cmdssize + jsfiles.length

            if (dirs('./bin/commands').length === i + 1) { //ready event continues here because i didn't find a better way to wait for the end of the loop
                if (cmdssize <= 0) logger("", "", "\x1b[41m> No commands found...\x1b[0m", true) 
                    else logger("", "", "> " + cmdssize + " commands found.", true)

                var bootend = 0;
                var bootend = v.d() - bootstart
                logger("", "", `> The Bot is \x1b[32mready\x1b[0m after ${v.round(bootend / 1000, 2)} sec!`, true)
                logger("", "", "*-----------------------------------------------*\n ", true)

                module.exports = {
                    bootend }
    }})})
});

/* ------------ Event Handlers: ------------ */
v.bot.on("guildCreate", guild => {
    servertosettings(guild)
    logger('info', 'shard.js', `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount-1} other members!`)
    
    //welcome message mit help link und settings setup aufforderung
})

v.bot.on("guildDelete", guild => {
    logger('info', 'shard.js', `I have been removed from: ${guild.name} (id: ${guild.id})`)

    delete v.bot.settings[guild.id]
    v.fs.writeFile(v.settingspath, JSON.stringify(v.bot.settings, null, 4), err => {
        if (err) logger('error', 'shard.js', `deleting guild (${guild.id}) from settings.json: ${err}`); return;
    }) });

v.bot.on("guildMemberAdd", async function(member) {
    if (v.config.loginmode == "test") return;

    //take care of greetmsg
    if (v.bot.settings[member.guild.id].systemchannel != null && v.bot.settings[member.guild.id].greetmsg != null) {
        //check settings.json for greetmsg, replace username and servername and send it into setting's systemchannel
        let msgtosend = String(v.bot.settings[member.guild.id].greetmsg)
        msgtosend = msgtosend.replace("username", member.user.username)
        msgtosend = msgtosend.replace("servername", member.guild.name)

        member.guild.channels.cache.get(String(v.bot.settings[member.guild.id].systemchannel)).send(msgtosend) }

    //take care of memberaddrole
    if (v.bot.settings[member.guild.id].memberaddroles.length > 0) {
        member.roles.add(v.bot.settings[member.guild.id].memberaddroles) } //add all roles at once (memberaddroles is an array)
});

v.bot.on("guildMemberRemove", async function(member) {
    if (v.config.loginmode == "test") return;
    if (v.bot.settings[member.guild.id].systemchannel == null) return;
    if (v.bot.settings[member.guild.id].byemsg == null) return;

    let msgtosend = String(v.bot.settings[member.guild.id].byemsg)
    msgtosend = msgtosend.replace("username", member.user.username)
    msgtosend = msgtosend.replace("servername", member.guild.name)

    member.guild.channels.cache.get(String(v.bot.settings[member.guild.id].systemchannel)).send(msgtosend)
})

/* ------------ Message Handler: ------------ */
v.bot.on('message', async function(message) {
    if (message.author.bot) return;

    if (message.channel.type !== "dm") {
        if (message.mentions.members.size > 0) {
            if (message.mentions.members.get(v.bot.user.id) != undefined) {
                message.react(v.bot.guilds.cache.get("331822220051611648").emojis.cache.find(emoji => emoji.name === "notification")).catch(err => {
                    logger('error', 'shard.js', "mention reaction Error: " + err) }) }}}

    if (message.channel.type !== "dm")
        if (!v.bot.settings[message.guild.id]) { servertosettings(message.guild) } //check if guild is not in settings.json and add it

    if (message.channel.type !== "dm") { var PREFIX = v.bot.settings[message.guild.id].prefix } else { var PREFIX = v.DEFAULTPREFIX } //get prefix for this guild or set default prefix if channel is dm

    if (message.content.startsWith(PREFIX)) { //check for normal prefix
        var cont = message.content.slice(PREFIX.length).split(" ");
    } else if (message.mentions.users.get(v.bot.user.id)) { //if no prefix given, check for mention
        var cont = message.content.slice(22).split(" "); //split off the mention <@id>

        if (cont[0] == "") { var cont = cont.slice(1) } //check for space between mention and command
        if (cont.toString().startsWith(PREFIX)) { var cont = cont.toString().slice(PREFIX.length).split(" "); } //the user even added a prefix between mention and cmd? get rid of it.
    } else { //normal message? stop.
        return; }

    if (!cont[0]) return; //message is empty after prefix I guess

    var args = cont.slice(1);
    var cmd  = v.bot.commands.get(cont[0].toLowerCase())

    if (message.channel.type === "dm") {
        if (cmd.info.allowedindm === false) return message.channel.send(v.randomstring(["That cannot work in a dm. :face_palm:","That won't work in a DM...","This command in a DM? No.","Sorry but no. Try it on a server.","You need to be on a server!"]) + " (DM-Error)") }

    if (cmd) { //check if command is existing and run it
        if (cmd.info.nsfwonly == true && !message.channel.nsfw) return message.channel.send(v.lang(message.guild.id).nsfwonlyerror)
        
        var ab = cmd.info.accessableby

        if (!ab.includes("all")) { //check if user is allowed to use this command
            if (ab.includes("botowner")) {
                if (message.author.id !== '231827708198256642') return message.channel.send(v.owneronlyerror(message.guild.id))
            } else if (message.author.id === message.guild.owner.id) {
                //nothing to do here, just not returning an error message and let the server owner do what he wants
            } else if (ab.includes("admins")) {
                if(!v.bot.settings[message.guild.id].adminroles.filter(element => message.member.roles.cache.has(element)).length > 0) return message.channel.send(v.usermissperm(message.guild.id))
            } else if (ab.includes("moderators")) {
                if(!v.bot.settings[message.guild.id].moderatorroles.filter(element => message.member.roles.cache.has(element)).length > 0) return message.channel.send(v.usermissperm(message.guild.id))
            } else {
                return logger('warn', 'shard.js', `The command restriction \x1b[31m'${ab}'\x1b[0m is invalid. Stopping the execution of the command \x1b[31m'${cont[0]}'\x1b[0m to prevent safety issues.`)
            }}

        if (message.channel.type === "dm") cmd.run(v.bot, message, args, v.englishlang)
            else cmd.run(v.bot, message, args, v.lang(message.guild.id))
        
        if (message.channel.type === "dm") {
            cmdusetofile("Cmd (DM)", cont, message.member) } else { cmdusetofile("Cmd", cont, message.guild.id) } //log cmd usage
        return;
    } else { //cmd not recognized? check if channel is dm and send error message
        if (message.channel.type === "dm") {
            message.channel.send(v.randomstring(["Invalid command! :neutral_face:","You got something wrong there!","Something is wrong... :thinking:","Oh shit you have to correct something!","This error should not have happened.","I'm sorry but i catched an error that was thrown by you.","Whoops - I didn't wanted this to happen.","Trust me. Something is wrong with your command.","Windows would have been crashed now!","That is not right."]) + " (Wrong command-Error)") }
        return; }
});

botstartupmode();
module.exports = {
    bootstart,
    ascii
}