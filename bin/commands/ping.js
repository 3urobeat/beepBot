module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const index = require("../../index.js")
    
    const botping = v.round(v.bot.ping, 2)
    var cont = message.content.slice(index.PREFIX.length).split(" ");

    if (v.bot.commands.get(cont[0].toLowerCase())) {
        var pingpong = "Pong!"
    } else {
        var pingpong = "Ping!"
    }
    message.channel.send({embed:{
        author:{
            name: index.BOTNAME,
            icon_url: v.bot.user.avatarURL
        },
        title: pingpong,
        description:":heartbeat: " + botping + "ms",
        color: 0x32CD32
    }})

}

module.exports.config = {
    command: "ping",
    alias: "pong"
}