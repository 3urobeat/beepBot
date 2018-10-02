module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    message.channel.send("Read all aliases here: https://github.com/HerrEurobeat/beepBot/blob/master/bin/help/aliasestext.txt \nIf you need help type *invite to get an invite to my server.").catch(err => {
        console.log("alias send message error: " + err)
    })
}

module.exports.config = {
    command: "alias",
    alias: "aliases"
}