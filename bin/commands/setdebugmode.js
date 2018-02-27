module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const fs = v.fs

    if (message.author.id === v.OWNERID) {
        var debugmode = args[0].toLowerCase()

        if (debugmode === v.botconfig.debug) {
            message.channel.send("The bot'S debug mode is already set to " + v.botconfig.debug + ".")
            return;
        }

        v.botconfig = {
            autoupdate: v.botconfig.autoupdate,
            shards: v.botconfig.shards,
            loginmode: v.botconfig.loginmode,
            prefix: v.botconfig.prefix,
            game: v.botconfig.game,
            version: v.botconfig.version,
            musicenable: v.botconfig.musicenable,
            debug: debugmode
        }

        fs.writeFile("./bin/config.json", JSON.stringify(v.botconfig, null, 4), err => {
            if(err) message.channel.send("Error: " + err); return;
        });
        console.log("Debugmode was set to: " + debugmode)

        if (v.os.platform == "linux") {
            message.channel.send("Debug mode was set to " + debugmode + ". Restarting... ")
            v.exec('pm2 restart bot')
        }
        if (v.os.platform == "win32") {
            message.channel.send("Debug mode was set to " + debugmode + "\nYou have to restart manually on windows to see changes.")
            return;
        }
    } else {
        message.channel.send(v.owneronlyerror())
    }

    }

module.exports.config = {
    command: "debugmode"
}
