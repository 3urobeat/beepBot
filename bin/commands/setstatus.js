module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const fs = v.fs;
    
    if (message.author.id === v.OWNERID) {
        if (args[0] === undefined) {
            message.channel.send("Please enter a valid status `online|idle|dnd`.")
            return;
        }

        var newstatus = args[0].toLowerCase()
        
        v.bot.user.setStatus(newstatus).catch(err => {
            message.channel.send("Error: " + err)
            return;
        })
        await console.log("New status set: " + newstatus)
        await message.channel.send("New status: " + newstatus)

        v.botconfig = {
            shards: v.botconfig.shards,
            loginmode: v.botconfig.loginmode,
            prefix: v.botconfig.prefix,
            game: v.botconfig.game,
            gametype: v.botconfig.gametype,
            status: newstatus,
            version: v.botconfig.version,
            debug: v.botconfig.debug
        }

        fs.writeFile("./bin/config.json", JSON.stringify(v.botconfig, null, 4), err => {
            if(err) message.channel.send("Error: " + err); return;
        });

    } else {
        message.channel.send(v.owneronlyerror())
        return;
    }

}

module.exports.config = {
    command: "setstatus"
}