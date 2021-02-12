//This file contains code of the guildMemberAdd event and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

module.exports.run = (bot, member) => {
    //take care of greetmsg
    bot.settings.findOne({ guildid: member.guild.id }, (err, guildsettings) => {
        if (!guildsettings) return; //yeah better stop if nothing was found to avoid errors

        if (guildsettings.systemchannel && guildsettings.greetmsg) {
            //check settings.json for greetmsg, replace username and servername and send it into setting's systemchannel
            let msgtosend = guildsettings.greetmsg

            if (msgtosend.includes("@username")) msgtosend = msgtosend.replace("@username", `<@${member.user.id}>`)
                else msgtosend = msgtosend.replace("username", member.user.username)
            msgtosend = msgtosend.replace("servername", member.guild.name)

            member.guild.channels.cache.get(String(guildsettings.systemchannel)).send(msgtosend).catch(() => {}) } //catch but ignore error

        //take care of memberaddrole
        if (guildsettings.memberaddroles.length > 0) {
            member.roles.add(guildsettings.memberaddroles) } //add all roles at once (memberaddroles is an array)
    })
}