module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const helptext = "Read all commands here: https://github.com/HerrEurobeat/beepBot/blob/master/bin/help/helptext.txt \nIf you need help type `*invite` to get an invite to my server.";

    message.channel.send(helptext).catch(err => {
        if (err) {
            console.log("help send message error: " + err)
            message.author.send("You are getting this message in DM because my message to your channel failed because of this: " + err + "\n" + helptext).catch(err => {
                console.log("help send dm message error: " + err)
            })
        }
    })
}

module.exports.config = {
    command: "help",
    alias: "commands",
    alias2: "h"
}