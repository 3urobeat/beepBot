module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const index = require("../index.js")

    var randomcolor = v.randomhex()

    if (args[0] === undefined) {
        message.channel.send({embed:{
            author: {
                name: index.BOTNAME,
                icon_url: bot.user.avatarURL,
                url: v.botinvitelink
            },
            description: "Random color: #" + randomcolor,
            color: randomcolor
            }})
        } else {
            if (message.content.includes("#")) {
                message.channel.send("Please remove any #'s.")
                return
            }
            message.channel.send({embed:{
                author: {
                    name: index.BOTNAME,
                    icon_url: bot.user.avatarURL,
                    url: v.botinvitelink
                },
                description: "Your color: #" + args[0],
                color: args[0]
                }}).catch(err => {
                    message.channel.send("Error: " + err)
                    return;
                })
        }
    }

module.exports.config = {
    command: "randomcolor",
    alias: "color"
}