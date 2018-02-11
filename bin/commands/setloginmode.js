module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const fs = v.fs

    if (message.author.id === v.OWNERID) {
        var login = args[0].toLowerCase()

        if (login === v.botconfig.loginmode) {
            message.channel.send("The bot is already in " + v.botconfig.loginmode + " mode.")
            return;
        }

        v.botconfig = {
            autoupdate: v.botconfig.autoupdate,
            shards: v.botconfig.shards,
            loginmode: login,
            prefix: v.botconfig.prefix,
            game: v.botconfig.game,
            version: v.botconfig.version,
            musicenable: v.botconfig.musicenable,
            debug: v.botconfig.debug
        }

        fs.writeFile(v.configpath, JSON.stringify(v.botconfig, null, 4), err => {
            if(err) message.channel.send("Error: " + err); return;
        });
        console.log("Loginmode was changed to: " + login)

        if (v.os.platform == "linux") {
            message.channel.send("Loginmode was changed to " + login + ". Restarting... ")
            v.exec('pm2 restart bot')
        }
        if (v.os.platform == "win32") {
            message.channel.send("Loginmode was changed to " + login + "\nYou have to restart manually on windows to see changes.")
            return;
        }
    } else {
        message.channel.send(v.owneronlyerror())
        return
    }

    }

module.exports.config = {
    command: "loginmode"
}