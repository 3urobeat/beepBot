var v = require("./vars.js")
v.checkm8();
var bootstart = 0;
var bootstart = v.d() //set time for bootup
var logger    = v.logger //make it more simple to interact with it
const ascii   = v.randomstring(v.asciipath.ascii) //set random ascii for this bootup

if (v.botconfig.shards > 1) { logger(v.LOGINFO() + "Starting with " + v.botconfig.shards + " shards!") }
logger(`${v.LOGINFO()} Initiating bootup sequence...`)
logger(`\n${ascii}\n`, true)

/* ------------ Functions: ------------ */
process.on('unhandledRejection', (reason, p) => {
    logger(`${v.LOGERR()}Unhandled Rejection! Reason: ${reason.stack}`) });

function botstartupmode() {
    try {
        logger(v.LOGINFO() + 'Logging in...', true)
        if (v.botconfig.loginmode === "normal") {
            v.bot.login(v.tokenpath.token) //login with normal token
            //setting appearance variables:
            BOTNAME   = "beepBot";
            GAME      = v.botconfig.game;
            BOTAVATAR = v.botdefaultavatar;
        } else if (v.botconfig.loginmode === "test") {
            v.bot.login(v.tokenpath.testtoken) //login with testbot token
            //setting appearance variables:
            BOTNAME   = "beepTestBot";
            if (v.botconfig.game === v.DEFAULTGAME) { GAME = "testing beepBot..." } else { GAME = v.botconfig.game }
            BOTAVATAR = v.testbotdefaultavatar;
        } else {
            logger(v.LOGERR() + "Specified loginmode in config is invalid! Aborting..."); v.bot.destroy(); }
    } catch(err) { logger(v.LOGERR() + "function botstartupmode error logging in: " + err) }}

function avatarinterval(cb) {
    if (v.d().getMonth() == 11) {
        if (v.botconfig.loginmode === "normal") v.bot.user.setUsername(v.BOTXMASNAME).catch(err => { logger(v.LOGWARN() + `XMAS Username error: ${err}`) })
            else v.bot.user.setUsername("beepTestBot").catch(err => { logger(v.LOGWARN() + `(testmode) XMAS Username error: ${err}`) })
        if (v.botconfig.loginmode === "normal") v.bot.user.setAvatar(v.botxmasavatar).catch(err => { logger(v.LOGWARN() + `XMAS Avatar error: ${err}`) })
            else v.bot.user.setAvatar(v.testbotdefaultavatar).catch(err => { logger(v.LOGWARN() + `(testmode) XMAS Avatar error: ${err}`) })
        cb("XMAS");
    } else {
        v.bot.user.setUsername(BOTNAME).catch(err => { logger(v.LOGWARN() + `Username error: ${err}`) })
        v.bot.user.setAvatar(BOTAVATAR).catch(err => { logger(v.LOGWARN() + `Avatar error: ${err}`) })
        cb("normal"); }
    lastavatarinterval = Date.now() + (3600000 * 6) }

function updateserverlist() {
    serverlist = []
    v.bot.guilds.cache.array().forEach((e, i) => {
        serverlist.push(e.name + "\n")

        if (i + 1 == v.bot.guilds.cache.array().length) {
            v.fs.writeFile("./bin/serverlist.txt", serverlist.join(""), err => { //join() removes commas from array
                if (err) logger(v.LOGERR() + "function updateserverlist error writing serverlist.txt: " + err) }) } })

    lastserverlistinterval = Date.now() + (1800000) }

function servertosettings(guild) {
    v.bot.settings[guild.id] = {
        prefix: v.DEFAULTPREFIX,
        lang: "english",
        adminroles: [],
        moderatorroles: [],
        systemchannel: null,
        greetmsg: null,
        byemsg: null,
        memberaddroles: []
    }
    v.fs.writeFile(v.settingspath, JSON.stringify(v.bot.settings, null, 4), err => {
        if(err) logger(v.LOGERR() + `writing server (${guild.id}) to settings.json: ${err}`) })
       
    //adding prefix to server nickname    
    if (v.bot.guilds.get(guild.id).members.get(v.bot.user.id).nickname === null) { var nickname = v.bot.user.username } else { var nickname = v.bot.guilds.get(guild.id).members.get(v.bot.user.id).nickname }
    v.bot.guilds.get(guild.id).members.get(v.bot.user.id).setNickname(`${nickname} [${v.DEFAULTPREFIX}]`).catch(err => {}) }

function cmdusetofile(cmdtype, cont, guildid) {
    v.fs.appendFile("./bin/cmduse.txt",`${cmdtype} ${cont} got used! [${v.d().getHours()}:${v.d().getMinutes()}:${v.d().getSeconds()}] (${guildid})\n`, err => {
        if (err) logger(v.LOGERR() + `writing cmduse to cmduse.txt: ${err}`) }) }


/* ------------ Startup: ------------ */
v.bot.on("ready", async function() {
    logger(v.LOGINFO() + "Loading...", true)

    logger(`\n                ${v.LOGINFO()}         `, true)
    logger("*-----------------------------------------------*", true)
    logger(`> Started ${BOTNAME} ${v.botconfig.version} by ${v.BOTOWNER}`, true)
    if (v.botconfig.shards > 1) logger(`> ${v.botconfig.shards} shards running in \x1b[32m${v.botconfig.loginmode}\x1b[0m mode on ${process.platform}`, true); 
        else logger(`> Running in \x1b[32m${v.botconfig.loginmode}\x1b[0m mode on ${process.platform}.`, true);

    v.bot.user.setPresence({game: { name: GAME, type: v.botconfig.gametype, url: v.streamlink}, status: v.botconfig.status }).catch(err => { //game switching loop todo
        logger(v.LOGERR() + "setPresence Game/Status error: " + err)}) 

    //Calls avatarinterval once and then every 6 hours by checking when the last interval happened.
    avatarinterval(function(type) { 
        logger(`> Presence: ${v.botconfig.status} - ${v.botconfig.gametype} '${GAME}' (${type})`, true) }); //log avatarinterval combined with game, status etc.
    v.bot.setInterval(() => {
        if (Date.now() > lastavatarinterval) {
            avatarinterval(function(type) {
                logger(v.LOGINFO() + `Updated name and avatar to ${type}. [${v.d()}]`, true) })}
    }, 30000); //check every 30 seconds

    //serverlist.txt refresh once on startup than every hour:
    updateserverlist();
    v.bot.setInterval(() => {
        if (Date.now() > lastserverlistinterval) {
            updateserverlist();
            //logger(v.LOGINFO() + `Updated serverlist.txt. [${v.d()}]`) 
        }
    }, 30000);

    //Log the startup in the cmduse.txt file
    v.fs.appendFile("./bin/cmduse.txt", ` \nStarting ${v.botconfig.version} in ${v.botconfig.loginmode} mode. ${v.d()}]\n`, err => {
        if (err) logger(v.LOGERR() + "writing startup to cmduse.txt error: " + err) });

    //Command reader:
    const { readdirSync, statSync } = require('fs')
    const { join } = require('path')

    const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())
    cmdssize = 0;

    dirs('./bin/commands').forEach((k, i) => {
        v.fs.readdir(`./bin/commands/${k}`, (err, files) => {
            if (err) logger(v.LOGERR() + err);
            var jsfiles = files.filter(p => p.split('.').pop() === 'js');
            
            jsfiles.forEach((f) => {
                var cmds = require(`./commands/${k}/${f}`);

                for(j = 0; j < Object.keys(cmds.aliases).length; j++) { //get all aliases of each command
                    v.bot.commands.set(Object.values(cmds.aliases)[j], cmds) }
            })
            cmdssize = cmdssize + jsfiles.length

            if (dirs('./bin/commands').length === i + 1) { //ready event continues here because i didn't find a better way to wait for the end of the loop
                if (cmdssize <= 0) { logger("\x1b[41m> No commands found...\x1b[0m", true) } else { logger("> " + cmdssize + " commands found.", true) }

                var bootend = 0;
                var bootend = v.d() - bootstart
                logger(`> The Bot is \x1b[32mready\x1b[0m after ${bootend}ms!`, true)
                logger("*-----------------------------------------------*\n ", true)

                module.exports ={
                    bootend
                }
    }})})
});

/* ------------ Event Handlers: ------------ */


/* ------------ Message Handler: ------------ */
v.bot.on('message', async function(message) {
    if (message.author.bot) return;

    if (message.channel.type !== "dm") {
        if (message.mentions.members.size > 0) {
            if (message.mentions.members.get(v.bot.user.id) != undefined) {
                message.react(v.bot.guilds.get("331822220051611648").emojis.find(emoji => emoji.name === "notification")).catch(err => {
                    logger(v.LOGERR() + "mention reaction Error: " + err)})}}}

    if (message.channel.type !== "dm")
        if (!v.bot.settings[message.guild.id]) { servertosettings(message.guild) } //check if guild is not in settings.json and add it

    if (v.botconfig.loginmode == "normal") { //get prefix for this guild or set default prefix if channel is dm
        if (message.channel.type !== "dm") { var PREFIX = v.bot.settings[message.guild.id].prefix } else { var PREFIX = v.DEFAULTPREFIX }
    } else { //set prefix for testbot
        var PREFIX = v.DEFAULTTESTPREFIX }

    if (message.content.startsWith(PREFIX)) { //check for normal prefix
        var cont = message.content.slice(PREFIX.length).split(" ");
    } else if (message.mentions.users.get(v.bot.user.id)) { //if no prefix given, check for mention
        var cont = message.content.slice(23).split(" "); //split off the mention <@id>

        if (cont[0] == "") { var cont = cont.slice(1) } //check for space between mention and command
        if (cont.toString().startsWith(PREFIX)) { var cont = cont.toString().slice(PREFIX.length).split(" "); } //the user even added a prefix between mention and cmd? get rid of it.
    } else { //normal message? stop.
        return; }

    var args = cont.slice(1);
    var cmd  = v.bot.commands.get(cont[0].toLowerCase())

    if (message.channel.type === "dm") {
        if (cmd.info.allowedindm === false) return message.channel.send(v.randomstring(["That cannot work in a dm. :face_palm::skin-tone-2:","That won't work in a DM...","This command in a DM? No.","Sorry but no. Try it on a server.","You need to be on a server!"]) + " (DM-Error)")}

    if (cmd) { //check if command is existing and run it
        var ab = cmd.info.accessableby

        if (!ab.includes("all")) { //check if user is allowed to use this command
            if (ab.includes("botowner")) {
                if (message.author.id !== '231827708198256642') return message.channel.send(v.owneronlyerror(guildid))
            } else if (message.author.id === message.guild.owner.id) {
                //nothing to do here, just not returning an error message and let the server owner do what he wants
            } else if (ab.includes("admins")) {
                if(!v.bot.settings[guildid].adminroles.filter(element => message.member.roles.keyArray().includes(element)).length > 0) return message.channel.send(v.usermissperm(guildid))
            } else if (ab.includes("moderators")) {
                if(!v.bot.settings[guildid].moderatorroles.filter(element => message.member.roles.keyArray().includes(element)).length > 0) return message.channel.send(v.usermissperm(guildid))
            } else {
                return logger(v.LOGWARN() + `The command restriction \x1b[31m'${ab}'\x1b[0m is invalid. Stopping the execution of the command \x1b[31m'${cont[0]}'\x1b[0m to prevent safety issues.`)
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
    ascii
}