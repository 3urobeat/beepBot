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

module.exports.info = {
    names: ["poll", "vote", "survey"],
    description: "Reacts with thumbs up/down to your message.",
    usage: "[poll description]",
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false
}