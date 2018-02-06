module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const index = require("../index.js")
    const fs = v.fs;
    
    if (message.author.id === v.OWNERID) {
        if (v.os.platform == "linux") {
            v.exec('node /home/pi/Desktop/beepBot/downloader.js')
            message.channel.send("Linux updater started...")
        } else {
            message.channel.send("The bot is not running on Linux!")
            return;
        }
    } else {
        message.channel.send(v.owneronlyerror())
        return;
    }

}

module.exports.config = {
    command: "updater",
    alias: "update"
}