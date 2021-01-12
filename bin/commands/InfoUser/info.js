module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    const si         = require("systeminformation")
    const Discord    = require("discord.js")
    var infofields   = []
    var thumbnailurl = ""

    //Small function to avoid repeating code
    function quickInfoField(index, name, value, inline) {
        return infofields[index] = {
            name: lang.cmd.info[name],
            value: String(lang.cmd.info[value]).replace("prefix", guildsettings.prefix),
            inline: inline
        } }

    if (!args[0]) { args[0] = "" }
    if (!args[1]) { args[1] = "" }
    switch(args[0].toLowerCase()) {
        case "user":
            if (!args[1] || message.channel.type == "dm") var whichuser = message.author
            else if (message.guild.members.cache.find(member => member.user.username == args[1])) var whichuser = message.guild.members.cache.find(member => member.user.username == args[1]).user
            else if (message.guild.members.cache.find(member => member.nickname == args[1])) var whichuser = message.guild.members.cache.find(member => member.nickname == args[1]).user
            else if (message.guild.members.cache.get(args[1])) var whichuser = message.guild.members.cache.get(args[1]).user
            else if (message.mentions.users.first()) var whichuser = message.mentions.users.first()
            else return message.channel.send(lang.cmd.info.usernotfound)

            thumbnailurl = whichuser.displayAvatarURL()
            var alluseractivites = ""
            var usernickname = ""

            whichuser.presence.activities.forEach((e, i) => {
                if (i == 0) alluseractivites += `${e.name}`
                    else alluseractivites += `, ${e.name}`

                if (i + 1 == Object.keys(whichuser.presence.activities).length && alluseractivites.length >= 25) { 
                    alluseractivites = alluseractivites.slice(0, 25) + "..." } })

            if (message.channel.type == "dm" || message.guild.members.cache.get(whichuser.id).nickname == null) usernickname = "/"
                    else usernickname = message.guild.members.cache.get(whichuser.id).nickname

            if (args[1].toLowerCase() == "mobile") { //Provide mobile option because the other version looks way nicer on Desktop but is completely screwed over on mobile
                //Mobile version
                infofields[0] = {
                    name: lang.cmd.info.user,
                    value: `**Username:** ${whichuser.name}#${whichuser.discriminator}\n` +
                           `**Nickname:** ${usernickname}\n` +
                           `**Status:** ${whichuser.presence.status}\n` +
                           `**Games:** (${Object.keys(whichuser.presence.activities).length}) ${alluseractivites}\n` +
                           `**ID:** ${whichuser.id}\n` +
                           `**Creation Date:** ${(new Date(whichuser.createdAt - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, ' ').replace(/\..+/, '')}`,
                    inline: true }
                
                quickInfoField(1, "bot", "botshowmore", false)
                quickInfoField(2, "server", "servershowmore", false)
            } else {
                //Desktop version
                infofields[0] = {
                    name: lang.cmd.info.user,
                    value: `Username:\n` +
                           `Nickname:\n` +
                           `Status:\n` +
                           `Games: (${Object.keys(whichuser.presence.activities).length})\n` +
                           `ID:\n` +
                           `Creation Date:`,
                    inline: true }

                infofields[1] = {
                    name: "\u200b",
                    value: `${whichuser.username}#${whichuser.discriminator}\n` +
                           `${usernickname}\n` +
                           `${whichuser.presence.status}\n` +
                           `${alluseractivites}\n` +
                           `${whichuser.id}\n` +
                           `${(new Date(whichuser.createdAt - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, ' ').replace(/\..+/, '')}`,
                    inline: true }

                infofields[2] = {
                    name: "\u200b",
                    value: "\u200b" }

                quickInfoField(3, "bot", "botshowmore", true)
                quickInfoField(4, "server", "servershowmore", true) }
            break;
        case "server":
            if (message.channel.type == "dm") return message.channel.send(lang.cmd.info.serverdmerror)

            thumbnailurl = message.guild.iconURL()

            if (args[1].toLowerCase() == "mobile") {
                //Mobile version
                infofields[0] = {
                    name: lang.cmd.info.server,
                    value: `**Name:** ${message.guild.name}\n` +
                           `**ID:** ${message.guild.id}\n` +
                           `**Owner:** ${message.guild.owner}\n` +
                           `**User Count:** ${message.guild.members.cache.size}\n` +
                           `**This Channel ID:** ${message.channel.id}\n` +
                           `**Server Region:** ${message.guild.region}\n` +
                           `**Bot Shard ID:** ${message.guild.shardID}\n` +
                           `**Creation Date:** ${(new Date(message.guild.createdAt - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, ' ').replace(/\..+/, '')}`,
                    inline: true }

                quickInfoField(1, "bot", "botshowmore", false)
                quickInfoField(2, "user", "usershowmore", false)
            } else {
                //Desktop version
                infofields[0] = {
                    name: lang.cmd.info.server,
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

                quickInfoField(3, "bot", "botshowmore", true)
                quickInfoField(4, "user", "usershowmore", true) }
            break;
        default:
            thumbnailurl = bot.user.displayAvatarURL()
            var cpuTemp = await si.cpuTemperature(async (cb) => { return cb })
            var cpuUsage = await si.currentLoad(async (cb) => { return cb })
            if (cpuTemp.main == -1) cpuTemp.main = "/" //si can't read temp

            if (args[1].toLowerCase() == "mobile") {
                //Mobile version
                infofields[0] = {
                    name: `**${lang.cmd.info.bot}** - Mobile`,
                    value: `**Uptime:** ${fn.round(bot.uptime / 3600000, 2)} hours\n` +
                           `**Heartbeat:** ${fn.round(bot.ws.ping, 2)} ms\n` +
                           `**RAM Usage:** ${Math.round(process.memoryUsage()["rss"] / 1024 / 1024 * 100) / 100} MB (RSS)\n` +
                           `**CPU Temp:** ${cpuTemp.main} °C\n` +
                           `**CPU Usage:** ${fn.round(cpuUsage.currentload, 2)} %\n` +
                           `**Node.js:** ${process.version}\n` +
                           `**Discord.js:** v${Discord.version}\n` +
                           `**Server Count:** ${(await bot.shard.fetchClientValues("guilds.cache.size")).reduce((a, b) => b + a)}\n` +
                           `**Shard Count:** ${bot.shard.count}\n` +
                           `**Invite:** [Click here!](${bot.constants.botinvitelink})\n`,
                    inline: true }

                quickInfoField(3, "user", "usershowmore", false)
                quickInfoField(4, "server", "servershowmore", false)
            } else {
                //Desktop version
                infofields[0] = {
                    name: lang.cmd.info.bot,
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
                    value: `${fn.round(bot.uptime / 3600000, 2)} hours\n` +
                           `${fn.round(bot.ws.ping, 2)} ms\n` +
                           `${Math.round(process.memoryUsage()["rss"] / 1024 / 1024 * 100) / 100} MB (RSS)\n` +
                           `${cpuTemp.main} °C\n` +
                           `${fn.round(cpuUsage.currentload, 2)} %\n` +
                           `${process.version}\n` +
                           `v${Discord.version}\n` +
                           `${(await bot.shard.fetchClientValues("guilds.cache.size")).reduce((a, b) => b + a)}\n` +
                           `${bot.shard.count}\n` +
                           `[Click here!](${bot.constants.botinvitelink})`,
                    inline: true }

                infofields[2] = {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true } 
                
                quickInfoField(3, "user", "usershowmore", true)
                quickInfoField(4, "server", "servershowmore", true) }
    }

    message.channel.send({ 
        embed: {
            title: `${bot.constants.BOTNAME} - ${lang.cmd.info.info}`,
            color: fn.randomhex(),
            thumbnail: { url: thumbnailurl },
            description: `${bot.constants.BOTNAME} version ${bot.config.version} made by ${bot.constants.BOTOWNER}\n${bot.constants.githublink}`,
            fields: infofields,
            footer: { icon_url: message.author.displayAvatarURL(), text: `${lang.general.requestedby} ${message.author.username} • If you are on mobile type ${guildsettings.prefix}info bot mobile` }
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