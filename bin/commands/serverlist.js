module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    v.fs.writeFile("./bin/serverlist.txt", "", err => {
        if (err) message.channel.send("Error: " + err)
    })
    for (guilds of v.bot.guilds){
        v.fs.appendFile("./bin/serverlist.txt", "  " + guilds[1].name + "\n", err => {
            if (err) message.channel.send("Error: " + err)
        });
    }
    message.channel.startTyping()  
    v.bot.setTimeout(() => {
        message.channel.send("**Serverlist: `(" + v.bot.guilds.size + ")`**\n" + v.fs.readFileSync("./bin/serverlist.txt", {"encoding": "utf-8"}))
        message.channel.stopTyping()
    }, 1000)

}

module.exports.config = {
    command: "serverlist",
    alias: "servers"
}