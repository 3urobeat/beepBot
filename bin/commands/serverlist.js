module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    message.channel.startTyping()  
    v.bot.setTimeout(() => {
        var str = "**Serverlist: `(" + v.bot.guilds.size + ")`**\n" + v.fs.readFileSync("./bin/serverlist.txt", {"encoding": "utf-8"})
        for(let i = 0; i < str.length; i += 2000) {
            const toSend = str.substring(i, Math.min(str.length, i + 2000));
            message.channel.send(toSend).catch(err => {
                message.channel.send("Error: " + err)
                console.log("serverlist send list Error: ")
            })
        }    
        message.channel.stopTyping()
    }, 500)

}

module.exports.config = {
    command: "serverlist",
    alias: "servers"
}