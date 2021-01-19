module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    var banuser = fn.getuserfrommsg(message, args, false);
    if (Object.keys(banuser).length == 0) return message.channel.send(lang.general.usernotfound);

    if (message.guild.owner && message.guild.owner.id !== message.author.id && message.guild.members.cache.get(banuser.id).roles.highest.position >= message.member.roles.highest.position) {
        return message.channel.send(lang.cmd.ban.highestRoleError) }

    if (banuser.id == bot.user.id) return message.channel.send(fn.randomstring(lang.cmd.ban.botban))
    if (banuser.id == message.author.id) return message.channel.send(lang.cmd.ban.selfban)

    if (message.guild.members.cache.get(banuser.id).roles.highest.position >= message.guild.members.cache.get(bot.user.id).roles.highest.position) {
        return message.channel.send(lang.cmd.ban.botRoleTooLow) }

    var banreason, banreasontext = ""
    var notargs1 = ["-time", "-t", "-notify", "-n", undefined] //things the next check shouldn't be

    if (!notargs1.includes(args[1])) { //args[1] isn't something from the array
        let newargs = [ ...args ] //make a copy of the original array because splice would modify it
        if (newargs.includes("-t")) newargs.splice(newargs.indexOf("-t"), 3)
            else if (newargs.includes("-time")) newargs.splice(newargs.indexOf("-time"), 3)
        
        if (newargs.includes("-n")) newargs.splice(newargs.indexOf("-n"), 1)
            else if (newargs.includes("-notify")) newargs.splice(newargs.indexOf("-notify"), 1)

        banreason, banreasontext = newargs.slice(1).join(" ")
    } else { 
        banreasontext = "/" 
        banreason = undefined }

    //Checks user perms and ban
    if (message.member.permissions.has("BAN_MEMBERS", "ADMINISTRATOR")) {
        message.guild.members.cache.get(banuser.id).ban(banreason).then(() => {
            var notifytimetext = lang.cmd.ban.permanent //if not permanent it will get changed by the time argument code block

            //Time Argument
            if (message.content.includes("-time") || message.content.includes("-t")) {
                fn.gettimefrommsg(args, (timeinms, unitindex, arrcb) => { //the 3 arguments inside brackets are arguments from the callback
                    if (!timeinms) return message.channel.send(lang.general.unsupportedtime.replace("timeargument", arrcb[1]))

                    let timedbansobj = {
                        userid: banuser.id,
                        until: Date.now() + timeinms,
                        guildid: message.guild.id,
                        authorid: message.author.id,
                        banreason: banreasontext
                    }
    
                    bot.timedbans.remove({ userid: banuser.id }, (err) => { if (err) logger("error", "ban.js", `error removing user ${banuser.id}: ${err}`) }) //remove an old entry if there should be one
                    bot.timedbans.insert(timedbansobj, (err) => { if (err) logger("error", "ban.js", "error inserting user: " + err) })
                    message.channel.send(lang.cmd.ban.tempbanmsg.replace("username", banuser.username).replace("timetext", `${arrcb[0]} ${lang.general.gettimefuncoptions[unitindex]}`).replace("banreasontext", banreasontext))
                    message.react("✅").catch(() => {}) //catch but ignore error

                    notifytimetext = `${arrcb[0]} ${lang.general.gettimefuncoptions[unitindex]}` //change permanent to timetext
                    fn.msgtomodlogchannel(message.guild, "ban", message.author, banuser, [banreasontext, `${arrcb[0]} ${lang.general.gettimefuncoptions[unitindex]}`, message.content.includes("-notify") || message.content.includes("-n")]) //details[2] results in boolean
                })
            } else {
                message.channel.send(lang.cmd.ban.permbanmsg.replace("username", banuser.username).replace("banreasontext", banreasontext))
                message.react("✅").catch(() => {}) //catch but ignore error
                fn.msgtomodlogchannel(message.guild, "ban", message.author, banuser, [banreasontext, lang.cmd.ban.permanent, message.content.includes("-notify") || message.content.includes("-n")]) } //details[2] results in boolean

            //Notify argument
            if (message.content.includes("-notify") || message.content.includes("-n")) {
                if (!banuser.bot) banuser.send(lang.cmd.ban.bannotifymsg.replace("servername", message.guild.name).replace("banreasontext", banreasontext).replace("timetext", notifytimetext)).catch(err => {
                    message.channel.send(lang.general.dmerror + err) }) }
            
        }).catch(err => {
            message.channel.send(`${lang.general.anerroroccurred} ${err}`)
            message.react("❌").catch(() => {}) }) //catch but ignore error
    } else {
        message.channel.send(fn.usermissperm(lang))
        message.react("❌").catch(() => {}) } //catch but ignore error
    
}

module.exports.info = {
    names: ["ban"],
    description: "cmd.ban.infodescription",
    usage: '(mention/username) [reason] [-time/-t Number "seconds"/"minutes"/"hours"/"days"/"months"/"years"] [-notify/-n]',
    accessableby: ['admins'],
    allowedindm: false,
    nsfwonly: false
}