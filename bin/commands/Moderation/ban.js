module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    var Discord = require("discord.js");

    var banuser = fn.getuserfrommsg(message, args, 0, null, false, ["-r", "-t", "-n"]);
    if (!banuser) return message.channel.send(lang.general.usernotfound)
    if (typeof (banuser) == "number") return message.channel.send(lang.general.multipleusersfound.replace("useramount", banuser))

    if (message.guild.fetchOwner() && message.guild.fetchOwner().id !== message.author.id && message.guild.members.cache.get(banuser.id).roles.highest.position >= message.member.roles.highest.position) {
        return message.channel.send(lang.cmd.ban.highestRoleError)
    }

    if (banuser.id == bot.user.id) return message.channel.send(fn.randomstring(lang.cmd.ban.botban))
    if (banuser.id == message.author.id) return message.channel.send(lang.cmd.ban.selfban)

    if (message.guild.members.cache.get(banuser.id).roles.highest.position >= message.guild.members.cache.get(bot.user.id).roles.highest.position) {
        return message.channel.send(lang.cmd.ban.botRoleTooLow)
    }

    //Get reason if there is one provided
    var banreason, banreasontext = ""

    fn.getreasonfrommsg(args, ["-time", "-t", "-notify", "-n", undefined], (reason, reasontext) => {
        banreason = reason
        banreasontext = reasontext
    })

    //Checks user perms and ban
    if (message.member.permissions.has(Discord.Permissions.FLAGS.BAN_MEMBERS, Discord.Permissions.FLAGS.ADMINISTRATOR)) {
        message.guild.members.cache.get(banuser.id).ban({ reason: banreason }).then(() => {
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

                    notifytimetext = `${arrcb[0]} ${lang.general.gettimefuncoptions[unitindex]}` //change permanent to timetext

                    bot.timedbans.remove({$and: [{ userid: banuser.id }, { guildid: message.guild.id }] }, (err) => { if (err) logger("error", "ban.js", `error removing user ${banuser.id}: ${err}`) }) //remove an old entry if there should be one
                    bot.timedbans.insert(timedbansobj, (err) => { if (err) logger("error", "ban.js", "error inserting user: " + err) })
                    message.channel.send(lang.cmd.ban.tempbanmsg.replace("username", banuser.username).replace("timetext", notifytimetext).replace("banreasontext", banreasontext))
                    message.react("✅").catch(() => {}) //catch but ignore error

                    fn.msgtomodlogchannel(message.guild, "ban", message.author, banuser, [banreasontext, notifytimetext, message.content.includes("-notify") || message.content.includes("-n")]) //details[2] results in boolean
                })
            } else {
                message.channel.send(lang.cmd.ban.permbanmsg.replace("username", banuser.username).replace("banreasontext", banreasontext))
                message.react("✅").catch(() => {}) //catch but ignore error
                fn.msgtomodlogchannel(message.guild, "ban", message.author, banuser, [banreasontext, lang.cmd.ban.permanent, message.content.includes("-notify") || message.content.includes("-n")]) //details[2] results in boolean
            }

            //Notify argument
            if (message.content.includes("-notify") || message.content.includes("-n")) {
                if (!banuser.bot) banuser.send(lang.cmd.ban.bannotifymsg.replace("servername", message.guild.name).replace("banreasontext", banreasontext).replace("timetext", notifytimetext)).catch(err => {
                    message.channel.send(lang.general.dmerror + err)
                })
            }
            
        }).catch(err => {
            message.channel.send(`${lang.general.anerroroccurred} ${err}`)
            message.react("❌").catch(() => {}) //catch but ignore error
        })
    } else {
        message.channel.send(fn.usermissperm(lang))
        message.react("❌").catch(() => {}) //catch but ignore error
    }
    
}

module.exports.info = {
    names: ["ban"],
    description: "cmd.ban.infodescription",
    usage: '(mention/username) [-r reason] [-time/-t Number "seconds"/"minutes"/"hours"/"days"/"months"/"years"] [-notify/-n]',
    accessableby: ['admins'],
    allowedindm: false,
    nsfwonly: false
}