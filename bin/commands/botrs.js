module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.author.id === v.OWNERID) {
        if (v.os.platform == "win32") {
            process.exit();
            return;
        }

        if (v.os.platform == "linux") {
            message.channel.send("Restarting bot...")
            v.exec('pm2 restart bot')
        }
        console.log("Process exit via botstop command...")
    } else {
        message.channel.send(v.owneronlyerror())
        return;
    }

}

module.exports.config = {
    command: "botrs",
    alias: "botrestart"
}