module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    for (guilds of v.bot.guilds){
        message.channel.send(guilds[1].name);
      } 

}

module.exports.config = {
    command: "serverlist"
}