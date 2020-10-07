module.exports.run = async (bot, message, args, lang) => {
    const v      = require("../../vars.js")
    const botjs  = require("../../bot.js")
    const logger = v.logger

    var infofields = []
    var thumbnailurl = ""

    //Small function to avoid repeating code
    function quickInfoField(index, name, value, inline) {
        return infofields[index] = {
            name: lang[name],
            value: String(lang[value]).replace("prefix", v.bot.settings[message.guild.id].prefix),
            inline: inline
        } }

    if (!args[0]) { args[0] = "" }
    if (!args[1]) { args[1] = "" }
    switch(args[0].toLowerCase()) {
        case "user":
            thumbnailurl = message.author.displayAvatarURL()
            var alluseractivites = ""
            var usernickname = ""

            message.author.presence.activities.forEach((e, i) => {
                if (i == 0) alluseractivites += `${e.name}`
                    else alluseractivites += `, ${e.name}`

                if (i + 1 == Object.keys(message.author.presence.activities).length) { 
                    alluseractivites = alluseractivites.slice(0, 25) + "..." } })

            if (message.guild.members.cache.get(message.author.id).nickname == null) usernickname = "/"
                    else usernickname = message.guild.members.cache.get(message.author.id).nickname

            if (args[1].toLowerCase() == "mobile") { //Provide mobile option because the other version looks way nicer on Desktop but is completely screwed over on mobile
                //Mobile version
                infofields[0] = {
                    name: lang.user,
                    value: `**Username:** ${message.author.name}#${message.author.discriminator}\n` +
                           `**Nickname:** ${usernickname}\n` +
                           `**Status:** ${message.author.presence.status}\n` +
                           `**Games:** (${Object.keys(message.author.presence.activities).length}) ${alluseractivites}\n` +
                           `**ID:** ${message.author.id}\n` +
                           `**Creation Date:** ${(new Date(message.author.createdAt - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, ' ').replace(/\..+/, '')}`,
                    inline: true }
                
                quickInfoField(1, "bot", "infobotshowmore", false)
                quickInfoField(2, "server", "infoservershowmore", false)
            } else {
                //Desktop version
                infofields[0] = {
                    name: lang.user,
                    value: `Username:\n` +
                           `Nickname:\n` +
                           `Status:\n` +
                           `Games: (${Object.keys(message.author.presence.activities).length})\n` +
                           `ID:\n` +
                           `Creation Date:`,
                    inline: true }

                infofields[1] = {
                    name: "\u200b",
                    value: `${message.author.username}#${message.author.discriminator}\n` +
                           `${usernickname}\n` +
                           `${message.author.presence.status}\n` +
                           `${alluseractivites}\n` +
                           `${message.author.id}\n` +
                           `${(new Date(message.author.createdAt - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, ' ').replace(/\..+/, '')}`,
                    inline: true }

                infofields[2] = {
                    name: "\u200b",
                    value: "\u200b" }

                quickInfoField(3, "bot", "infobotshowmore", true)
                quickInfoField(4, "server", "infoservershowmore", true) }
            break;
        case "server":
            thumbnailurl = message.guild.iconURL()

            if (args[1].toLowerCase() == "mobile") {
                //Mobile version
                infofields[0] = {
                    name: lang.server,
                    value: `**Name:** ${message.guild.name}\n` +
                           `**ID:** ${message.guild.id}\n` +
                           `**Owner:** ${message.guild.owner}\n` +
                           `**User Count:** ${message.guild.members.cache.size}\n` +
                           `**This Channel ID:** ${message.channel.id}\n` +
                           `**Server Region:** ${message.guild.region}\n` +
                           `**Bot Shard ID:** ${message.guild.shardID}\n` +
                           `**Creation Date:** ${(new Date(message.guild.createdAt - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, ' ').replace(/\..+/, '')}`,
                    inline: true }

                quickInfoField(1, "bot", "infobotshowmore", false)
                quickInfoField(2, "user", "infousershowmore", false)
            } else {
                //Desktop version
                infofields[0] = {
                    name: lang.server,
                    value: `Name:\n` +
                           `ID:\n` +
                           `Owner:\n` +
                           `User Count:\n` +
                           `This Channel ID:\n` +
                           `Server Region:\n` +
                           `Bot Shard ID:\n` +
                           `Creation Date:`,
                    inline: true }

                infofields[1] = {
                    name: "\u200b",
                    value: `${message.guild.name}\n` +
                           `${message.guild.id}\n` +
                           `${message.guild.owner}\n` +
                           `${message.guild.members.cache.size}\n` +
                           `${message.channel.id}\n` +
                           `${message.guild.region}\n` +
                           `${message.guild.shardID}\n` +
                           `${(new Date(message.guild.createdAt - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, ' ').replace(/\..+/, '')}`,
                    inline: true }

                infofields[2] = {
                    name: "\u200b",
                    value: "\u200b" }

                quickInfoField(3, "bot", "infobotshowmore", true)
                quickInfoField(4, "user", "infousershowmore", true) }
            break;
        default:
            thumbnailurl = v.bot.user.displayAvatarURL()
            let cpuTemp = await v.si.cpuTemperature(async (cb) => { return cb })
            let cpuUsage = await v.si.currentLoad(async (cb) => { return cb })

            if (args[1].toLowerCase() == "mobile") {
                //Mobile version
                infofields[0] = {
                    name: `**${lang.bot}** - Mobile`,
                    value: `**Uptime:** ${v.round(v.bot.uptime / 3600000, 2)} hours\n` +
                           `**Heartbeat:** ${v.round(v.bot.ws.ping, 2)} ms\n` +
                           `**RAM Usage:** ${Math.round(process.memoryUsage()["rss"] / 1024 / 1024 * 100) / 100} MB (RSS)\n` +
                           `**CPU Temp:** ${cpuTemp.main} °C\n` +
                           `**CPU Usage:** ${v.round(cpuUsage.currentload, 2)} %\n` +
                           `**Node.js:** ${process.version}\n` +
                           `**Discord.js:** v${v.Discord.version}\n` +
                           `**Server Count:** ${(await v.bot.shard.fetchClientValues("guilds.cache.size")).reduce((a, b) => b + a)}\n` +
                           `**Shard Count:** ${v.bot.shard.count}\n` +
                           `**Invite:** [Click here!](${v.botinvitelink})\n`,
                    inline: true }

                quickInfoField(3, "user", "infousershowmore", false)
                quickInfoField(4, "server", "infoservershowmore", false)
            } else {
                //Desktop version
                infofields[0] = {
                    name: lang.bot,
                    value: `Uptime:\n` +
                           `Heartbeat:\n` +
                           `RAM Usage:\n` +
                           `CPU Temp:\n` +
                           `CPU Usage:\n` +
                           `Node.js:\n` +
                           `Discord.js:\n` +
                           `Server Count:\n` +
                           `Shard Count:\n` +
                           `Invite:\n`,
                    inline: true }

                infofields[1] = {
                    name: "\u200b",
                    value: `${v.round(v.bot.uptime / 3600000, 2)} hours\n` +
                           `${v.round(v.bot.ws.ping, 2)} ms\n` +
                           `${Math.round(process.memoryUsage()["rss"] / 1024 / 1024 * 100) / 100} MB (RSS)\n` +
                           `${cpuTemp.main} °C\n` +
                           `${v.round(cpuUsage.currentload, 2)} %\n` +
                           `${process.version}\n` +
                           `v${v.Discord.version}\n` +
                           `${(await v.bot.shard.fetchClientValues("guilds.cache.size")).reduce((a, b) => b + a)}\n` +
                           `${v.bot.shard.count}\n` +
                           `[Click here!](${v.botinvitelink})`,
                    inline: true }

                infofields[2] = {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true } 
                
                quickInfoField(3, "user", "infousershowmore", true)
                quickInfoField(4, "server", "infoservershowmore", true) }
    }

    message.channel.send({ 
        embed: {
            title: `${v.BOTNAME} - ${lang.info}`,
            color: v.randomhex(),
            thumbnail: { url: thumbnailurl },
            description: `${v.BOTNAME} version ${v.config.version} made by ${v.BOTOWNER}\n${v.githublink}`,
            fields: infofields,
            footer: { icon_url: message.author.displayAvatarURL(), text: `${lang.requestedby} ${message.author.username} • If you are on mobile type ${v.bot.settings[message.guild.id].prefix}info bot mobile` }
        }
    })
    
}

module.exports.info = {
    names: ["info"],
    description: "Get info about a user, the server and the bot.",
    usage: '["bot"/"user"/"server"] ["mobile"]',
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}