module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.channel.type == "dm") {
        message.channel.send("A poll does not make sense in a dm! :no_good:")
        return;
    } else {
        await message.react("👍").catch(err => {
            message.channel.send("Error: " + err)
            return;
        })
        await message.react("👎").catch(err => {
            message.channel.send("Error: " + err)
            return;
        })
        await message.react("🤷").catch(err => {
            message.channel.send("Error: " + err)
            return;
        })
    } 

}

module.exports.config = {
    command: "poll",
    alias: "vote",
    alias2: "survey"
}