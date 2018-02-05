module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const fs = v.fs

/*     const servers = v.fs.readFileSync("./../servers.txt", {"encoding": "utf-8"}); */
    for (guilds of v.bot.guilds){
        message.channel.send(guilds[1].name);
      }
 

}

module.exports.config = {
    command: "serverlist",
    alias: "servers"
}