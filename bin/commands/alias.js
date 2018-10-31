module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const aliastext = "Read all aliases here: https://github.com/HerrEurobeat/beepBot/blob/master/bin/help/aliasestext.txt \nIf you need help type `*invite` to get an invite to my server.";

    message.channel.send(aliastext).catch(err => {
        if (err) {
            console.log("alias send message error: " + err)
            message.author.send("You are getting this message in DM because my message to your channel failed because of this: " + err + "\n" + aliastext).catch(err => {
                console.log("alias send dm message error: " + err)
            })
        }
    })
}

module.exports.config = {
    command: "alias",
    alias: "aliases"
}