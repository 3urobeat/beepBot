module.exports.run = async (bot, message, args, lang) => {
    const v = require("../../vars.js")
    const index = require("../../shard.js")
    var logger = v.logger
   
    const m = await message.channel.send({embed:{
                        author:{
                            name: index.BOTNAME,
                            icon_url: v.bot.user.avatarURL
                        },
                        title: "Ping" + "?",
                        color: 0xFFA500
                    }});

    var botheartbeat = v.round(v.bot.ws.ping, 2)
    var botpingpong = v.round(m.createdTimestamp - message.createdTimestamp, 2)

    m.edit(({embed:{
                author:{
                    name: index.BOTNAME,
                    icon_url: v.bot.user.avatarURL
                },
                title: "Pong" + "!",
                description:":heartbeat: " + botheartbeat + "ms\n:ping_pong: " + botpingpong + "ms",
                color: 0x32CD32
            }}));
    
}

module.exports.aliases = {
    1: "ping",
    2: "pong"
}
module.exports.info = {
    name: "ping",
    description: "Returns the ping and heartbeat of the bot.",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false,
    aliases: this.aliases
}