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
                for (guilds of v.bot.guilds){
                    v.fs.appendFile("./bin/serverlist.txt", "  " + guilds[1].name + "\n", err => {
                        if (err) message.channel.send("Error: " + err)
                    });
                }
                v.bot.setTimeout(() => {
                    message.channel.send("serverlist.txt has been cleared and refreshed.")
                }, 1000) 
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
