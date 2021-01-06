module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    let m = await message.channel.send({embed:{
                        title: "Ping?",
                        color: 0xFFA500
                    }} );

    let botheartbeat = fn.round(bot.ws.ping, 2)
    let botpingpong = fn.round(m.createdTimestamp - message.createdTimestamp, 2)

    m.edit({embed:{
                title: "Pong!",
                description:":heartbeat: " + botheartbeat + "ms\n:ping_pong: " + botpingpong + "ms",
                color: 0x32CD32
            } });
    
}

module.exports.info = {
    names: ['ping', 'pong'],
    description: 'Returns the ping and heartbeat of the bot.',
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}