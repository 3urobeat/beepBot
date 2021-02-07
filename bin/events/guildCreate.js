//This file contains code of the guildCreate event and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

module.exports.run = (bot, logger, guild) => { //eslint-disable-line
    bot.fn.servertosettings(guild)
    logger('info', 'guildCreate.js', `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount-1} other members!`)
    
    //get suitable channel to post welcome message to
    let welcomechannel = null

    if (guild.systemChannelID) welcomechannel = guild.systemChannelID //then check if guild has a systemChannel set
        else {
            //well then try and get the first channel (rawPosition) where the bot has permissions to send a message
            //get all text channels into array and sort them by ascending rawPositions
            let textchannels = guild.channels.cache.filter(c => c.type == "text").sort((a, b) => a.rawPosition - b.rawPosition)
            welcomechannel = textchannels.find(c => c.permissionsFor(bot.user).has("SEND_MESSAGES")).id } //find the first channel with perms

    //check react permission
    if (!guild.channels.cache.get(welcomechannel).permissionsFor(bot.user).has("ADD_REACTIONS")) var footertext = bot.langObj["english"].general.botaddfooternoreactperm //can't react footer text
        else var footertext = bot.langObj["english"].general.botaddfooter

    //if no channel was found try to contact the guild owner
    if (!welcomechannel) {
        guild.owner.send({embed: {
            title: bot.langObj["english"].general.botaddtitle,
            description: bot.langObj["english"].general.botadddesc + bot.langObj["english"].general.botadddesc2.replace(/prefix/g, bot.constants.DEFAULTPREFIX),
            thumbnail: { url: bot.user.displayAvatarURL() },
            footer: {
                text: footertext }
        } })
            .then((msg) => { langreact(msg) })
            .catch((err) => { logger("warn", "guildCreate.js", "Failed to send owner welcome msg on createGuild: " + err) })
    } else {
        guild.channels.cache.get(welcomechannel).send({embed: {
            title: bot.langObj["english"].general.botaddtitle,
            description: bot.langObj["english"].general.botadddesc + bot.langObj["english"].general.botadddesc2.replace(/prefix/g, bot.constants.DEFAULTPREFIX),
            thumbnail: { url: bot.user.displayAvatarURL() },
            footer: {
                text: footertext }
        } })
            .then((msg) => { langreact(msg) })
            .catch((err) => { logger("warn", "guildCreate.js", "Failed to send owner welcome msg on createGuild: " + err) })
    }

    function langreact(msg) {
        if (!guild.channels.cache.get(welcomechannel).permissionsFor(bot.user).has("ADD_REACTIONS")) return; //stop right here if the bot doesn't have permission to add reactions in this channel

        Object.keys(bot.langObj).forEach((e, i) => {
            setTimeout(() => {
                msg.react(bot.langObj[e]["general"]["langemote"]).then((res) => {
                    bot.monitorreactions.insert({ type: "createGuildlang", msg: res.message.id, reaction: res._emoji.name, guildid: guild.id, channelid: res.message.channel.id, enablesettingslangchange: true, until: Date.now() + 2629800000 }, (err) => { if (err) logger("error", "guildCreate.js", "Error inserting guildCreate language reactions to db: " + err) }) //time is 1 month
                }).catch((err) => { logger("warn", "guildCreate.js", `Error trying to react with ${bot.langObj[e]["general"]["langemote"]} to createGuild welcome message: ${err}`) })
            }, i * 250); //delay each reaction by 250ms to avoid a cooldown
        }) }
}