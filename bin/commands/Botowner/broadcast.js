module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    if (!args[0]) return message.channel.send(lang.cmd.otherbotowner.saymissingargs) //same message so we are just using that

    bot.shard.broadcastEval(`
        this.guilds.cache.forEach((e, i) => {
            this.settings.findOne({ guildid: e.id }, (err, guildsettings) => {

                if (guildsettings && guildsettings.systemchannel) var channelid = guildsettings.systemchannel //check if guild has a systemchannel set in bot settings
                    else if (e.systemChannelID) var channelid = e.systemChannelID //Check for systemchannel in guild settings
                    else if (guildsettings && guildsettings.modlogchannel) var channelid = guildsettings.modlogchannel //Check if guild has a modlogchannel set in bot settings
                    else if ("${args[0]}" == "true") { //get first best channel if force is true
                        var channelid = null

                        let textchannels = e.channels.cache.filter(c => c.type == "text").sort((a, b) => a.rawPosition - b.rawPosition)
                        var channelid = textchannels.find(c => c.permissionsFor(this.user).has("SEND_MESSAGES")).id
                    }
                
                if (!channelid) return; //no channel found

                e.channels.cache.get(String(channelid)).send("${args.slice(1).join(" ")}")
            })
        })
    `)

    message.channel.send(lang.cmd.otherbotowner.broadcastmessagesent)
}

module.exports.info = {
    names: ["broadcast"],
    description: "Broadcasts a message to all guilds. Force will try to get the first channel with permissions.",
    usage: '(force "true"/"false") (message)',
    accessableby: ['botowner'],
    allowedindm: true,
    nsfwonly: false
}