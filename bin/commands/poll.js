module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.channel.type == "dm") {
        message.channel.send("A poll does not make sense in a dm! :no_good:")
        return;
    } else {
        await message.react("👍")
        await message.react("👎")
        await message.react("🤷")
    } 

}

module.exports.config = {
    command: "poll",
    alias: "vote",
    alias2: "survey"
}