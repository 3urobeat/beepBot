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
            var wantedcolor = args[0]
            switch(args[0].toLowerCase()) {
                case "colors":
                    message.channel.send("Supported 'word' colors: black, gray, red, green, blue, yellow, purple, gold, cyan, white, pink.\nDisplay your color with *color (hex code).\nGet a random color by just typing *color")
                    return;
                case "black":
                    var wantedcolor = 0x000000
                case "gray":
                    var wantedcolor = 0x808080
                case "red":
                    var wantedcolor = 0xFF0000
                case "green":
                    var wantedcolor = 0x00FF00
                case "blue":
                    var wantedcolor = 0x0000FF
                case "yellow":
                    var wantedcolor = 0xFFFF00
                case "purple":
                    var wantedcolor = 0x800080
                case "gold":
                    var wantedcolor = 0xFFD700
                case "cyan":
                    var wantedcolor = 0x00FFFF
                case "white":
                    var wantedcolor = 0xFFFFFF
                case "pink":
                    var wantedcolor = 0xFFC0CB

            }
            
            message.channel.send({embed:{
                author: {
                    name: index.BOTNAME,
                    icon_url: bot.user.avatarURL,
                    url: v.botinvitelink
                },
                description: "Your color: #" + wantedcolor,
                color: wantedcolor
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