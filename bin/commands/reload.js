module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const fs = v.fs

    if (message.author.id === v.OWNERID) {
        if(args[0] === undefined) return message.reply("Must provide a command name to reload.");
        // the path is relative to the *current folder*, so just ./filename.js
        try {
            delete require.cache[require.resolve(`./${args[0]}.js`)]
            //if module is serverlist.js needed serverlist.txt is cleared
            if (args[0] === "serverlist") {
                v.fs.writeFile("./bin/serverlist.txt", "", err => {
                    if (err) message.channel.send("Error: " + err)
                })
                message.channel.send("serverlist.txt has been cleared.")
            }
            message.reply(`The command ${args[0]} has been reloaded.`);
        } catch (err) {
            message.channel.send("Error: " + err)
        }
    } else {
        message.channel.send(v.owneronlyerror())
    }

    }

module.exports.config = {
    command: "reload"
}
