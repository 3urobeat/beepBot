module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const fs = v.fs;
    
    if (message.author.id === v.OWNERID) {

        var newversion = args[0]
        var oldversion = v.botconfig.version
        
        if (newversion === undefined) {
            message.channel.send("Please enter a valid number.")
            return;
        }

        v.botconfig = {
            autoupdate: v.botconfig.autoupdate,
            shards: v.botconfig.shards,
            loginmode: v.botconfig.loginmode,
            prefix: v.botconfig.prefix,
            game: v.botconfig.game,
            version: newversion,
            musicenable: v.botconfig.musicenable,
            debug: v.botconfig.debug
        }

        fs.writeFile("./bin/config.json", JSON.stringify(v.botconfig, null, 4), err => {
            if(err) message.channel.send("Error: " + err); return;
        });

        console.log("New version set: " + newversion + " Old: " + oldversion)

        if (v.os.platform == "linux") {
            message.channel.send("New version set: " + newversion + " Old: " + oldversion + " Restarting... ")
            v.exec('pm2 restart bot')
        }
        if (v.os.platform == "win32") {
            message.channel.send("New version set: " + newversion + " Old: " + oldversion + "\nYou have to restart manually on windows to see changes.")
            return;
        }

    } else {
        message.channel.send(v.owneronlyerror())
        return;
    }

}

module.exports.config = {
    command: "setversion"
}