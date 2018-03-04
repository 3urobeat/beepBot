module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const index = require("../index.js")
    
    var cont = message.content.slice(index.PREFIX.length).split(" ");

    if (v.bot.commands.get(cont[0].toLowerCase())) {
        var pingpong = "Pong"
    } else {
        var pingpong = "Ping"
    }
    
    const m = await message.channel.send({embed:{
                        author:{
                            name: index.BOTNAME,
                            icon_url: v.bot.user.avatarURL
                        },
                        title: pingpong + "?",
                        color: 0xFFA500
                    }});

    var botheartbeat = v.round(v.bot.ping, 2)
    var botpingpong = v.round(m.createdTimestamp - message.createdTimestamp, 2)

    m.edit(({embed:{
                author:{
                    name: index.BOTNAME,
                    icon_url: v.bot.user.avatarURL
                },
                title: pingpong + "!",
                description:":heartbeat: " + botheartbeat + "ms\n:ping_pong: " + botpingpong + "ms",
                color: 0x32CD32
            }}));
    
}

module.exports.config = {
    command: "ping",
    alias: "pong"
}