module.exports.run = async (bot, message, args, lang) => {
    const v = require("../../vars.js")
    
    await message.react("👍").catch(err => {
        message.channel.send("poll react error: " + err)
        return; })

    await message.react("👎").catch(err => {
        message.channel.send("poll react error: " + err)
        return; })

    await message.react("🤷").catch(err => {
        message.channel.send("poll react error: " + err)
        return; })
}

module.exports.aliases = {
    1: "poll",
    2: "vote",
    3: "survey"
}
module.exports.info = {
    name: "poll",
    description: "Reacts with thumbs up/down to your message.",
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false,
    aliases: this.aliases
}