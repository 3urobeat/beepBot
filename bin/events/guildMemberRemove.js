//This file contains code of the servertosettings function and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

module.exports.run = (bot, member) => {
    bot.settings.findOne({ guildid: member.guild.id }, (err, guildsettings) => {
        if (!guildsettings) return; //yeah better stop if nothing was found to avoid errors
        if (!guildsettings.systemchannel) return;
        if (!guildsettings.byemsg) return;

        let msgtosend = String(guildsettings.byemsg)
        msgtosend = msgtosend.replace("username", member.user.username)
        msgtosend = msgtosend.replace("servername", member.guild.name)

        let channel = member.guild.channels.cache.get(String(guildsettings.systemchannel))
        
        if (!channel) return;
        channel.send(msgtosend).catch(() => {}) //catch but ignore error
    })
}