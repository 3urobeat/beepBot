﻿//This file controls one shard
const v      = require("./vars.js")
const fs     = require("fs")
const path   = require("path")
const logger = v.logger
const shardArgs = process.argv //ignore index 0 and 1

process.on('unhandledRejection', (reason, p) => {
    logger('error', 'bot.js', `Unhandled Rejection! Reason: ${reason.stack}`) });


/* -------------- Command reader -------------- */
const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())

dirs('./bin/commands').forEach((k, i) => {
    v.fs.readdir(`./bin/commands/${k}`, (err, files) => {
        if (err) logger('error', 'controller.js', err);
        var jsfiles = files.filter(p => p.split('.').pop() === 'js');
        
        jsfiles.forEach((f) => {
            var cmd = require(`./commands/${k}/${f}`);

            for(j = 0; j < cmd.info.names.length; j++) { //get all aliases of each command
                var tempcmd = JSON.parse(JSON.stringify(cmd)) //Yes, this practice of a deep copy is probably bad but everything else also modified other Collection entries and I sat at this problem for 3 fucking hours now
                tempcmd["run"] = cmd.run //Add command code to new deep copy because that got lost somehow
                tempcmd.info.category = k

                if (j != 0) tempcmd.info.thisisanalias = true //seems like this is an alias
                    else tempcmd.info.thisisanalias = false

                v.bot.commands.set(tempcmd.info.names[j], tempcmd) }
        })
    })
})

/* ------------ Startup: ------------ */
v.bot.on("ready", async function() {
    //Set activity
    v.bot.user.setPresence({activity: { name: v.config.gamerotation[0] }, status: v.config.status }).catch(err => { return logger("", "", "Woops! Couldn't set presence: " + err); })

    let currentgameindex = 1
    var gamerotationloop = setInterval(() => { //interval has a name to be able to clear it (for what ever reason): clearInterval(gamerotationloop)
        v.bot.user.setPresence({activity: { name: v.config.gamerotation[currentgameindex].replace("servercount", v.bot.guilds.cache.size) }, status: v.config.status }).catch(err => { return logger("warn", "bot.js", "Woops! Couldn't set presence: " + err); })
    
        currentgameindex++
        if (currentgameindex == v.config.gamerotation.length) currentgameindex = 0
    }, v.config.gamerotateseconds * 1000)
});

/* ------------ Event Handlers: ------------ */
v.bot.on("guildCreate", guild => {
    servertosettings(guild)
    logger('info', 'bot.js', `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount-1} other members!`)
    
    //welcome message mit help link und settings setup aufforderung
})

v.bot.on("guildDelete", guild => {
    logger('info', 'bot.js', `I have been removed from: ${guild.name} (id: ${guild.id})`)

    delete v.bot.settings[guild.id]
    v.fs.writeFile(v.settingspath, JSON.stringify(v.bot.settings, null, 4), err => {
        if (err) logger('error', 'bot.js', `deleting guild (${guild.id}) from settings.json: ${err}`); return;
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
    if (message.channel.type == "text" && v.config.loginmode == "test") logger("info", "bot.js", `Shard ${message.guild.shardID}: ${message}`)

    if (message.channel.type !== "dm") {
        if (message.mentions.members.size > 0) {
            if (message.mentions.members.get(v.bot.user.id) != undefined) {
                message.react(v.bot.guilds.cache.get("331822220051611648").emojis.cache.find(emoji => emoji.name === "notification")).catch(err => {
                    logger('error', 'bot.js', "mention reaction Error: " + err) }) }}}

    if (message.channel.type !== "dm")
        if (!v.bot.settings[message.guild.id]) { v.servertosettings(message.guild) } //check if guild is not in settings.json and add it

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
    var cmd = v.bot.commands.get(cont[0].toLowerCase())

    if (message.channel.type === "dm") {
        if (cmd && cmd.info.allowedindm === false) return message.channel.send(v.randomstring(["That cannot work in a dm. :face_palm:","That won't work in a DM...","This command in a DM? No.","Sorry but no. Try it on a server.","You need to be on a server!"]) + " (DM-Error)") }

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
                message.channel.send("This command seems to have an invalid restriction setting. I'll have to stop the execution of this command to prevent safety issues.\n3urobeat#0975 will probably see this error and fix it.")
                logger('warn', 'bot.js', `The command restriction \x1b[31m'${ab}'\x1b[0m is invalid. Stopping the execution of the command \x1b[31m'${cont[0]}'\x1b[0m to prevent safety issues.`)
                return;
            }}

        if (message.channel.type === "dm") cmd.run(v.bot, message, args, v.englishlang)
            else cmd.run(v.bot, message, args, v.lang(message.guild.id)) //run the command
        
        return;
    } else { //cmd not recognized? check if channel is dm and send error message
        if (message.channel.type === "dm") {
            message.channel.send(v.randomstring(["Invalid command! :neutral_face:","You got something wrong there!","Something is wrong... :thinking:","Whoops - it seems like this command doesn't exists.","Trust me. Something is wrong with your command.","That is not right."]) + " (Wrong command-Error)") }
        return; }
});

v.bot.login() //Token is provided by the shard manager