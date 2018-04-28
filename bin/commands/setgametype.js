module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const fs = v.fs

    if (message.author.id === v.OWNERID) {
        if (args[0] === undefined) {
            message.channel.send("Missing argument. Use `playing|streaming|listening|watching`")
            return;
        }
        var gametype = args[0].toUpperCase()

        if (gametype === v.botconfig.gametype) {
            message.channel.send("The bot is already set to " + v.botconfig.gametype + ".")
            return;
        }

        v.botconfig = {
            shards: v.botconfig.shards,
            loginmode: v.botconfig.loginmode,
            prefix: v.botconfig.prefix,
            game: v.botconfig.game,
            gametype: gametype,
            status: v.botconfig.status,
            version: v.botconfig.version,
            debug: v.botconfig.debug
        }

        v.bot.user.setActivity(v.botconfig.game, { type: gametype, url: v.streamlink }).catch(err => {
            message.channel.send("Error: " + err)
            return;
        })

        await fs.writeFile("./bin/config.json", JSON.stringify(v.botconfig, null, 4), err => {
            if(err) message.channel.send("Error: " + err); return;
        });
        await console.log("Gametype was changed to: " + gametype)
        await message.channel.send("Gametype was changed to: " + gametype)

    } else {
        message.channel.send(v.owneronlyerror())
        return
    }

}

module.exports.config = {
    command: "gametype"
}