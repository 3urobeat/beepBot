const Discord = require('discord.js'); //eslint-disable-line

/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    let lf = lang.cmd.mute
    
    //Check if role was successfully created by guildCreate.js (where this code is also used)
    if (!message.guild.roles.cache.find(role => role.name == "beepBot Muted")) {
        message.guild.roles.create({
            data: {
                name: "beepBot Muted",
                color: "#99AAB5",
                permissions: [] },
            reason: lf.rolecreatereason
        })
            .then((role) => { //after creating role change permissions of every text channel
                var errorcount = 0
    
                message.guild.channels.cache.forEach((channel) => {
                    if (channel.type != "text") return;
    
                    channel.updateOverwrite(role, { SEND_MESSAGES: false, ADD_REACTIONS: false }, lf.rolechannelpermreason)
                        .catch((err) => {
                            if (errorcount < 1) message.channel.send(`${lf.rolechannelpermerror}\n${lang.general.error}: ${err}`)
                            errorcount++ }) //we don't want to spam the channel
                }) })
            .catch((err) => { message.channel.send(`${lf.rolecreateerror}\n${lang.general.error}: ${err}`) }) }

    
    //Get user and do other checks
    let args0 = ["chat", "voice", "all"] //things args[0] should be
    if (!args0.includes(args[0])) return message.channel.send(lf.invalidargs.replace("prefix", guildsettings.prefix))

    var muteuser = fn.getuserfrommsg(message, args, false);
    if (Object.keys(muteuser).length == 0) return message.channel.send(lang.general.usernotfound);

    if (muteuser.id == bot.user.id) return message.channel.send(fn.randomstring(lf.botmute))
    if (muteuser.id == message.author.id) return message.channel.send(lf.selfmute)

    var mutereason, mutereasontext = ""


    //Get reason if there is one provided
    let notargs1 = ["-time", "-t", "-notify", "-n", undefined] //things the next check shouldn't be

    if (!notargs1.includes(args[2])) { //args[1] isn't something from the array
        let newargs = [ ...args ] //make a copy of the original array because splice would modify it
        if (newargs.includes("-t")) newargs.splice(newargs.indexOf("-t"), 3)
            else if (newargs.includes("-time")) newargs.splice(newargs.indexOf("-time"), 3)
        
        if (newargs.includes("-n")) newargs.splice(newargs.indexOf("-n"), 1)
            else if (newargs.includes("-notify")) newargs.splice(newargs.indexOf("-notify"), 1)

        mutereason, mutereasontext = newargs.slice(2).join(" ")
    } else { 
        mutereasontext = "/" //used for message
        mutereason = undefined } //used for Discord & the audit log

    
    if (args[0].toLowerCase() == "chat" || args[0].toLowerCase() == "all") {
        //Apply role
        message.guild.members.cache.get(muteuser.id).roles.add(message.guild.roles.cache.find(role => role.name == "beepBot Muted"), mutereason)
            .catch(err => { //catch error of role adding
                return message.channel.send(`${lf.roleadderror}\n${lang.general.error}: ${err}`) }) }
          
    if (args[0].toLowerCase() == "voice" || args[0].toLowerCase() == "all") {
        //Apply voicemute if muteuser is in voice chat, if not the voiceStateUpdate event in bot.js will handle muting
        if (message.guild.members.cache.get(muteuser.id).voice.channel != null) { 
            message.guild.members.cache.get(muteuser.id).voice.setMute(true, mutereason)
                .catch(err => {
                    return message.channel.send(`${lf.voicemuteerror}\n${lang.general.error}: ${err}`) }) 
        } }

    
    //Add timed mute to db and respond with msg
    var notifytimetext = lang.cmd.ban.permanent //needed for notify - if not permanent it will get changed by the time argument code block below (and yes just hijack the translation from the ban cmd)

    if (message.content.includes("-time") || message.content.includes("-t")) { //timed mute
        fn.gettimefrommsg(args, (timeinms, unitindex, arrcb) => { //the 3 arguments inside brackets are arguments from the callback
            if (!timeinms) return message.channel.send(lang.general.unsupportedtime.replace("timeargument", arrcb[1]))

            let timedmuteobj = {
                type: "tempmute", //used to determine what action to take by the voiceStateUpdate event
                userid: muteuser.id,
                until: Date.now() + timeinms,
                where: args[0].toLowerCase(),
                guildid: message.guild.id,
                authorid: message.author.id,
                mutereason: mutereasontext
            }

            notifytimetext = `${arrcb[0]} ${lang.general.gettimefuncoptions[unitindex]}` //change permanent to timetext

            bot.timedmutes.remove({ userid: muteuser.id }, (err) => { if (err) logger("error", "mute.js", `error removing user ${muteuser.id}: ${err}`) }) //remove an old entry if there should be one
            bot.timedmutes.insert(timedmuteobj, (err) => { if (err) logger("error", "mute.js", "error inserting user: " + err) })
            message.channel.send(lf.tempmutemsg.replace("username", muteuser.username).replace("timetext", notifytimetext).replace("mutereasontext", mutereasontext))
        })

    } else { //permanent mute
        let permmuteobj = {
            type: "permmute", //used to determine what action to take by the voiceStateUpdate event
            userid: muteuser.id,
            where: "voice",
            guildid: message.guild.id,
            authorid: message.author.id,
            mutereason: mutereasontext
        }

        bot.timedmutes.remove({ userid: muteuser.id }, (err) => { if (err) logger("error", "mute.js", `error removing user ${muteuser.id}: ${err}`) }) //remove an old entry if there should be one
        bot.timedmutes.insert(permmuteobj, (err) => { if (err) logger("error", "mute.js", "error inserting user: " + err) })
        message.channel.send(lf.permmutemsg.replace("username", muteuser.username).replace("mutereasontext", mutereasontext)) }

    message.react("✅").catch(() => {}) //catch but ignore error
    fn.msgtomodlogchannel(message.guild, "mute", message.author, muteuser, [args[0].toLowerCase(), mutereasontext, notifytimetext, message.content.includes("-notify") || message.content.includes("-n")]) //details[2] results in boolean

    //Notify user if author provided argument
    if (message.content.includes("-notify") || message.content.includes("-n")) {
        if (!muteuser.bot) muteuser.send(lf.mutenotifymsg.replace("servername", message.guild.name).replace("mutereasontext", mutereasontext).replace("timetext", notifytimetext)).catch(err => {
            message.channel.send(lang.general.dmerror + err) }) }
}

module.exports.info = {
    names: ["mute"],
    description: "cmd.mute.infodescription",
    usage: '("voice"/"chat"/"all") (mention/username) [reason] [-time/-t Number "seconds"/"minutes"/"hours"/"days"/"months"/"years"] [-notify/-n]',
    accessableby: ['moderators'],
    allowedindm: false,
    nsfwonly: false
}