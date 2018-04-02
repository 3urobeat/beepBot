module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    message.channel.startTyping()  
    v.bot.setTimeout(() => {
        message.channel.send("**Serverlist: `(" + v.bot.guilds.size + ")`**\n" + v.fs.readFileSync("./bin/serverlist.txt", {"encoding": "utf-8"})).catch(err => {
            message.channel.send("Error: " + err)
        })
        message.channel.stopTyping()
    }, 500)

}

module.exports.config = {
    command: "serverlist",
    alias: "servers"
}