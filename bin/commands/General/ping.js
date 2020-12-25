module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    var m = await message.channel.send({embed:{
                        author:{
                            name: bot.user.username,
                            icon_url: bot.user.avatarURL
                        },
                        title: "Ping" + "?",
                        color: 0xFFA500
                    }});

    var botheartbeat = fn.round(bot.ws.ping, 2)
    var botpingpong = fn.round(m.createdTimestamp - message.createdTimestamp, 2)

    m.edit(({embed:{
                author:{
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL
                },
                title: "Pong" + "!",
                description:":heartbeat: " + botheartbeat + "ms\n:ping_pong: " + botpingpong + "ms",
                color: 0x32CD32
            }}));
    
}

module.exports.info = {
    names: ['ping', 'pong'],
    description: 'Returns the ping and heartbeat of the bot.',
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}