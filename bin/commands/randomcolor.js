module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const index = require("../../index.js")

    var randomcolor = v.randomhex()
    message.channel.send({embed:{
        author: {
            name: index.BOTNAME,
            icon_url: bot.user.avatarURL,
            url: v.botinvitelink
        },
        description: "Random color: #" + randomcolor,
        color: randomcolor
        }})
    }

module.exports.config = {
    command: "randomcolor",
    alias: "color"
}