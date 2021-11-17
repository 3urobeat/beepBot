//This file contains code of the guildCreate event and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

module.exports.run = async (bot, logger, guild) => { //eslint-disable-line
    bot.fn.servertosettings(guild)
    logger('info', 'guildCreate.js', `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount-1} other members!`)
    
    //get suitable channel to post welcome message to
    let welcomechannel = null

    if (guild.systemChannelId) {
        welcomechannel = guild.systemChannelId //then check if guild has a systemChannel set
    } else {
        //well then try and get the first channel (rawPosition) where the bot has permissions to send a message
        //get all text channels into array and sort them by ascending rawPositions
        let textchannels = guild.channels.cache.filter(c => c.type == "GUILD_TEXT").sort((a, b) => a.rawPosition - b.rawPosition)
        welcomechannel = textchannels.find(c => c.permissionsFor(bot.user).has("SEND_MESSAGES")).id //find the first channel with perms
    }

    //check react permission
    if (!guild.channels.cache.get(welcomechannel).permissionsFor(bot.user).has("ADD_REACTIONS")) {
        var footertext = bot.langObj["english"].general.botaddfooternoreactperm //can't react footer text
    } else {
        var footertext = bot.langObj["english"].general.botaddfooter
    }

    //if no channel was found try to contact the guild owner
    var guildowner = await guild.fetchOwner();
    
    if (!welcomechannel) {
        guildowner.user.send({
            embeds: [{
                title: bot.langObj["english"].general.botaddtitle,
                description: bot.langObj["english"].general.botadddesc + bot.langObj["english"].general.botadddesc2.replace(/prefix/g, bot.constants.DEFAULTPREFIX),
                thumbnail: { url: bot.user.displayAvatarURL() },
                footer: {
                    text: footertext
                }
            }]
        })
            .then((msg) => { langreact(msg) })
            .catch((err) => { logger("warn", "guildCreate.js", "Failed to send owner welcome msg on createGuild: " + err) })

    } else {

        guild.channels.cache.get(welcomechannel).send({
            embeds: [{
                title: bot.langObj["english"].general.botaddtitle,
                description: bot.langObj["english"].general.botadddesc + bot.langObj["english"].general.botadddesc2.replace(/prefix/g, bot.constants.DEFAULTPREFIX),
                thumbnail: { url: bot.user.displayAvatarURL() },
                footer: {
                    text: footertext
                }
            }] 
        })
            .then((msg) => { langreact(msg) })
            .catch((err) => { logger("warn", "guildCreate.js", "Failed to send owner welcome msg on createGuild: " + err) })
    }


    function langreact(msg) {
        if (!guild.channels.cache.get(welcomechannel).permissionsFor(bot.user).has("ADD_REACTIONS")) return; //stop right here if the bot doesn't have permission to add reactions in this channel

        Object.keys(bot.langObj).forEach((e, i) => {
            setTimeout(() => {

                msg.react(bot.langObj[e]["general"]["langemote"]).then((res) => {
                    bot.monitorreactions.insert({ type: "createGuildlang", msg: res.message.id, reaction: res._emoji.name, guildid: guild.id, channelid: res.message.channel.id, enablesettingslangchange: true, until: Date.now() + 2629800000 }, (err) => { if (err) logger("error", "guildCreate.js", "Error inserting guildCreate language reactions to db: " + err) }) //time is 1 month
                }).catch((err) => {
                    logger("warn", "guildCreate.js", `Error trying to react with ${bot.langObj[e]["general"]["langemote"]} to createGuild welcome message: ${err}`)
                })

            }, i * 250); //delay each reaction by 250ms to avoid a cooldown
        })
    }

    //Ensure that @everyone hasn't manage role enabled so that users can't remove the muted role from them
    guild.roles.cache.get(guild.id).setPermissions(guild.roles.cache.get(guild.id).permissions.remove("MANAGE_ROLES"), "Needed so that users are unable to remove the beepBot Muted role from their own roles.") //permissions.remove only returns the changed bitfield

    //Create beepBot Muted role (this code is used again in mute.js)
    guild.roles.create({
        data: {
            name: "beepBot Muted",
            color: "#99AAB5",
            permissions: []
        },
        reason: "Role needed to chat-mute users using the mute command." 
    })
        .then((role) => { //after creating role change permissions of every text channel
            var errormsgsent = false

            guild.channels.cache.forEach((channel) => {
                if (channel.type != "GUILD_TEXT") return;

                channel.updateOverwrite(role, { SEND_MESSAGES: false, ADD_REACTIONS: false }, "Needed change so that a muted user will be unable to send and react to messages.")
                    .catch((err) => { 
                        if (!errormsgsent) guild.channels.cache.get(welcomechannel).send(`I was sadly unable to change the permissions of the 'beepBot Muted' role in all channels.\nYou can fix this by checking/correcting my permissions and then running the mute command once.\nError: ${err}`) //message can technically only be in English - also: send this message only once
                    })
            }) 
        })
        .catch((err) => { guild.channels.cache.get(welcomechannel).send(`I was unable to create the 'beepBot Muted' role.\nError: ${err}`) }) //message can only be in English and shouldn't even occurr because the permission is already included in the invite link (same with the error above but you never know)
}