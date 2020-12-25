module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { 
    var kickuser = v.getuserfrommsg(message, args, false);
    if (Object.keys(kickuser).length == 0) return message.channel.send(lang.general.usernotfound);

    if (message.guild.owner && message.guild.owner.id !== message.author.id && message.guild.members.cache.get(kickuser.id).roles.highest.position >= message.member.roles.highest.position) {
        return message.channel.send(lang.cmd.kick.highestRoleError) }

    if (kickuser.id == bot.user.id) return message.channel.send(v.randomstring(lang.cmd.kick.botkick))
    if (kickuser.id == message.author.id) return message.channel.send(lang.cmd.kick.selfkick)

    if (message.guild.members.cache.get(kickuser.id).roles.highest.position >= message.guild.members.cache.get(bot.user.id).roles.highest.position) {
        return message.channel.send(lang.cmd.kick.botRoleTooLow) }

    var kickreason, kickreasontext = ""
    var notargs1 = ["-notify", "-n", undefined] //things the next check shouldn't be

    if (!notargs1.includes(args[1])) { //args[1] isn't something from the array
        kickreason, kickreasontext = args.slice(1).join(" ").replace("-notify", "").replace("-n", "");
    } else { 
        kickreasontext = "/" 
        kickreason = "" }

    //Checks user perms and kick
    if (message.member.permissions.has("KICK_MEMBERS", "ADMINISTRATOR")) {
        message.guild.members.cache.get(kickuser.id).kick(kickreason).then(member => {
            message.channel.send(lang.cmd.kick.kickmsg.replace("username", kickuser.username).replace("kickreasontext", kickreasontext))
            
            if (message.content.includes("-notify") || message.content.includes("-n")) {
                if (!kickuser.bot) kickuser.send(lang.cmd.kick.kicknotifymsg.replace("servername", message.guild.name).replace("kickreasontext", kickreasontext)) }
        }).catch(err => {
            message.channel.send(`${lang.general.anerroroccurred} ${err}`) })
    } else {
        message.channel.send(v.usermissperm()) }
}

module.exports.info = {
    names: ["kick"],
    description: "Kicks a user from the server. Add -notify to notify the kicked user.",
    usage: "(mention/username) [reason] [-notify/-n]",
    accessableby: ['moderators'],
    allowedindm: false,
    nsfwonly: false
}