module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    let msg = await message.channel.send({
        embeds: [{
            title: "Ping?",
            color: 0xFFA500
        }]
    });

    //Get heartbeat and calculate ping
    let botheartbeat = fn.round(bot.ws.ping, 2)
    let botpingpong  = fn.round(msg.createdTimestamp - message.createdTimestamp, 2)

    //Edit original message with results
    msg.edit({
        embeds: [{
            title: "Pong!",
            description:":heartbeat: " + botheartbeat + "ms\n:ping_pong: " + botpingpong + "ms",
            color: 0x32CD32
        }]
    });
    
}

module.exports.info = {
    names: ['ping', 'pong'],
    description: "cmd.othergeneral.pinginfodescription",
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}