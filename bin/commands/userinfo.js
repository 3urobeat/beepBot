module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const index = require("../index.js")
    
    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return;
    }   
    if (message.mentions.members.first() === undefined) {
        var usermentioninfo = message.author
        var usermentiontext = " "
        userinfo();
    } else {      
        var usermentioninfo = message.mentions.members.first().user
        var usermentiontext = "@" + message.mentions.members.first().user.username
        userinfo();
        }

    async function userinfo() {
        message.channel.send(index.BOTNAME + " Version " + v.BOTVERSION + " made by " + v.BOTOWNER + ". My Server: `discord.gg/q3KXW2P`");
        message.channel.send({embed:{
            author: {
                name: usermentioninfo.username,
                icon_url: usermentioninfo.avatarURL,
                url: message.member.user.avatarURL
            },
            fields: [{
                name: "Bot Info:",
                value: "\n**Bot Username:** " + v.bot.user.username + "\n**Bot ID:** " + v.bot.user.id + "\n**Bot Owner:** " + v.BOTOWNER + "\n**Bot Uptime:** " + v.round(v.bot.uptime / 3600000, 2) + " hours" + "\n**Bot Ping:** " + v.round(v.bot.ping, 2) + "ms" + "\n**Last bootup time:** " + index.bootend + "ms" + "\n**Servers:** " + v.bot.guilds.size + "\n**User Amount:** " + v.bot.users.size + "\n**Invite me:** [Click here!](" + index.botinvite + ")" 
              },
              {
                name: "User:",
                value: "\n**Nickname:** " + usermentioninfo.username + "\n**Tag:** #" + usermentioninfo.discriminator + "\n**User ID:** " + usermentioninfo.id + "\n**Created At:** " + message.member.user.createdAt + "\n**Avatar:** [Click here!](" + message.member.user.avatarURL + ")"
              },
              {
                name: "Server:",
                value: "\n**Name:** " + message.guild.name + "\n**Server ID:** " + message.guild.id + "\n**Server Owner:** " + message.guild.owner.user.username + "#" + message.guild.owner.user.discriminator + "\n**Created At:** " + message.guild.createdAt + "\n**User Count:** " + message.guild.memberCount + "\n**Channel Name:** #" + message.channel.name + "\n**Channel Count:** " + message.guild.channels.size + "\n**Channel ID:** " + message.channel.id + "\n**AFK Timeout:** " + message.guild.afkTimeout / "60" + " min\n**Server Icon:** get it with *servericon"
              }
            ],
            footer: {
                icon_url: message.author.avatarURL,
                text: "Requestet by " + message.author.username
            },
            color: 0x32CD32
    }})
    }
}

module.exports.config = {
    command: "info",
    alias: "userinfo",
    alias2: "me"
}