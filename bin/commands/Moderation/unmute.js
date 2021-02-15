const Discord = require('discord.js'); //eslint-disable-line

/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    let lf = lang.cmd.othermoderation
      
    //Get user and do other checks
    let args0 = ["chat", "voice", "all"] //things args[0] should be
    if (!args0.includes(args[0])) return message.channel.send(lf.unmuteinvalidargs.replace("prefix", guildsettings.prefix))

    var unmuteuser = fn.getuserfrommsg(message, args, 1, null, false, ["-r", "-n"]);
    if (!unmuteuser) return message.channel.send(lang.general.usernotfound)
    if (typeof (unmuteuser) == "number") return message.channel.send(lang.general.multipleusersfound.replace("useramount", unmuteuser))


    //Get reason if there is one provided
    var unmutereason, unmutereasontext = ""

    fn.getreasonfrommsg(args, ["-time", "-t", "-notify", "-n", undefined], (reason, reasontext) => {
        unmutereason = reason
        unmutereasontext = reasontext })

    
    if (args[0].toLowerCase() == "chat" || args[0].toLowerCase() == "all") { //user was muted in chat
        let mutedrole = message.guild.roles.cache.find(role => role.name == "beepBot Muted")

        if (mutedrole) { //only proceed if role still exists
            //Remove role
            message.guild.members.cache.get(unmuteuser.id).roles.remove(mutedrole, unmutereason)
                .catch(err => { //catch error of role adding
                    return message.channel.send(`${lf.unmuteroleremoveerror.replace("muteuser", unmuteuser.username)}\n${lang.general.error}: ${err}`) }) } }
    
    //remove matching userid and guildid entries from db now so that voiceStateUpdate won't attack
    bot.timedmutes.remove({$and: [{ userid: unmuteuser.id }, { guildid: message.guild.id }]}, (err => { if (err) logger("error", "controller.js", "Error removing ${e.userid} from timedmutes: " + err) }))

    if (args[0].toLowerCase() == "voice" || args[0].toLowerCase() == "all") { //user was banned in voice
        //Remove voice mute
        if (message.guild.members.cache.get(unmuteuser.id).voice.channel != null) {
            message.guild.members.cache.get(unmuteuser.id).voice.setMute(false, unmutereason)
                .catch(err => {
                    return message.channel.send(`${lf.unmutevoiceunmuteerror.replace("muteuser", unmuteuser.username)}\n${lang.general.error}: ${err}`) })
        } else {
            //if the user can't be unmuted right now push it into the db and handle it with the voiceStateUpdate event
            let unmuteobj = {
                type: "unmute", //used to determine what action to take by the voiceStateUpdate event if the user can't be muted right now
                userid: unmuteuser.id,
                where: "voice",
                guildid: message.guild.id,
                authorid: message.author.id,
                mutereason: unmutereasontext
            }
            
            bot.timedmutes.insert(unmuteobj, (err) => { if (err) logger("error", "controller.js", "error updating db: " + err) }) //insert new obj instead of updating old one so that the db remove call won't remove it
        }
    }

    message.react("✅").catch(() => {}) //catch but ignore error
    message.channel.send(lf.unmutemsg.replace("username", unmuteuser.username).replace("unmutereason", unmutereasontext))
    fn.msgtomodlogchannel(message.guild, "unmute", message.author, unmuteuser, ["manual", unmutereasontext])
}

module.exports.info = {
    names: ["unmute"],
    description: "cmd.othermoderation.unmuteinfodescription",
    usage: '("voice"/"chat"/"all") (mention/username) [-r reason]',
    accessableby: ['moderators'],
    allowedindm: false,
    nsfwonly: false
}