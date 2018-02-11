module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const fs = v.fs
    
    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return;
    }
    let banMember = message.guild.member(message.mentions.members.first());
    if (message.mentions.users.size === 0) {
        message.channel.send("Please mention a valid user!")
        return;
    } else {
        if(!banMember) {
            message.channel.send("That user does not seem valid.")
            return; }}
    if (banMember.id == v.bot.user.id) {
        message.channel.send(v.randomstring(["I won't ban myself what are you thinking?! :angry:","I don't like you anymore.","No. :angry:","Dont fight me with my own weapons!","Is there a way to block you?","Could someone kick this guy?"]))
        return; }
    if (banMember.id == message.author.id) {
        message.channel.send("You can't ban yourself. :facepalm:")
        return; }
    if (message.member.permissions.has("BAN_MEMBERS", "ADMINISTRATOR")) {
        let banauthor = message.author
        //ban code
        if (args[1] === undefined) {
            if (args[1] === undefined) {
                var banreasontext = "/"
                var banreason = ""
            } else {
                var banreason = args.slice(1).join(" ");
                var banreasontext = args.slice(1).join(" ");
            }

            banMember.ban(banreason).then(member => {
            message.channel.send(banMember + " was permanently banned. __Reason:__ " + banreasontext)
            banMember.send("You got permanently banned from **" + message.guild.name + "** by " + banauthor + " for this reason: " + banreasontext)
            }).catch(err => {
                message.channel.send("An error occured: " + err)
            })

        } else {
            let rawbanduration = args[1]
            let bandurationtype = args[2].toLowerCase()

            if (args[3] === undefined) {
                var banreasontext = "/"
                var banreason = ""
            } else {
                var banreason = args.slice(3).join(" ");
                var banreasontext = args.slice(3).join(" ");
            }

            if (isNaN(rawbanduration) === true) { message.channel.send("It's something but not a clear number."); return; }
            if (rawbanduration === undefined) { message.channel.send("The ban duration is not defined."); return; }

            if (bandurationtype === "seconds") {
                var banduration = rawbanduration * 1000
            } else if (bandurationtype === "minutes") { 
                var banduration = rawbanduration * 60000; 
            } else if (bandurationtype === "hours") { 
                var banduration = rawbanduration * 3600000;
            } else if (bandurationtype === "days") {
                var banduration = rawbanduration * 86400000;
            } else { 
                message.channel.send("Please provide 'minutes' or 'hours'"); 
                return;
            }

            bot.bans[banMember.id] = {
                name: banMember.user.username,
                guild: message.guild.id,
                time: Date.now() + banduration,
                banauthor: banauthor.id,
                banchannel: message.channel.id,
                rawbanduration: rawbanduration,
                bandurationtype: bandurationtype,
                banreason: banreasontext
            }

            banMember.ban(banreason).then(member => {
                message.channel.send(banMember + " was banned for " + rawbanduration + " " + bandurationtype + " by " + banauthor + ". __Reason:__ " + banreasontext)
                banMember.send("You got banned from **" + message.guild.name + "** by " + banauthor + " for " + rawbanduration + " " + bandurationtype + ". __Reason:__ " + banreasontext)

                fs.writeFile(v.banspath, JSON.stringify(bot.bans, null, 4), err => {
                    if(err) message.channel.send("Error: " + err); return;
                });

            }).catch(err => {
                message.channel.send("Error: " + err)
            })
        }
    } else {
        message.channel.send(v.usermissperm())
    }


}

module.exports.config = {
    command: "ban"
}
