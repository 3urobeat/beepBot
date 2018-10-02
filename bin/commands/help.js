module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    message.channel.send("Read all commands here: https://github.com/HerrEurobeat/beepBot/blob/master/bin/help/helptext.txt \nIf you need help type *invite to get an invite to my server.").catch(err => {
        console.log("help send message error: " + err)
    })
}

module.exports.config = {
    command: "help",
    alias: "commands",
    alias2: "h"
}