module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    if (!args[0]) return message.channel.send(lang.cmd.otherbotowner.saymissingargs) //same message so we are just using that

    bot.shard.broadcastEval(client => {
        client.guilds.cache.forEach((e) => {
            client.settings.findOne({ guildid: e.id }, (err, guildsettings) => {

                if (guildsettings && guildsettings.systemchannel) var channelid = guildsettings.systemchannel //check if guild has a systemchannel set in bot settings
                    else if (e.systemChannelId) var channelid = e.systemChannelId //Check for systemchannel in guild settings
                    else if (guildsettings && guildsettings.modlogchannel) var channelid = guildsettings.modlogchannel //Check if guild has a modlogchannel set in bot settings
                    else if (args[0] == "true") { //get first best channel if force is true
                        var channelid = null

                        let textchannels = e.channels.cache.filter(c => c.type == "GUILD_TEXT").sort((a, b) => a.rawPosition - b.rawPosition)
                        var channelid = textchannels.find(c => c.permissionsFor(client.user).has("SEND_MESSAGES")).id
                    }
                
                if (!channelid) return; //no channel found

                e.channels.cache.get(String(channelid)).send(args.slice(1).join(" "))
            })
        })
    })

    message.channel.send(lang.cmd.otherbotowner.broadcastmessagesent)
}

module.exports.info = {
    names: ["broadcast"],
    description: "cmd.otherbotowner.broadcastinfodescription",
    usage: '(force "true"/"false") (message)',
    accessableby: ['botowner'],
    allowedindm: true,
    nsfwonly: false
}