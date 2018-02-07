module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const index = require("../index.js")
    const fs = v.fs;
    
    if (message.author.id === v.OWNERID) {
        if (v.os.platform == "linux") {
            console.log("Manual updater started. Updating downloader.js...")
            message.channel.send("Manual updater started. Updating downloader.js...")
            v.exec('svn export https://github.com/HerrEurobeat/beepBot/trunk/downloader.js /home/pi/Desktop/beepBot/downloader.js')
            v.exec('rm -rf /home/pi/Desktop/beepBot/downloader.js')
            v.bot.setTimeout(() => {
                message.channel.send("Starting downloader.js...")
                v.exec('node /home/pi/Desktop/beepBot/downloader.js')
            }, 2500)
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