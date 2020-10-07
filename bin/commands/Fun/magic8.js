module.exports.run = async (bot, message, args, lang) => {
    const v      = require("../../vars.js")
    const botjs  = require("../../bot.js")
    const logger = v.logger

    if (!args[0]) return message.channel.send(lang.magic8missingargs)
    message.channel.send(":8ball: " + v.randomstring(lang.magic8responses))

}

module.exports.info = {
    names: ["magic8", "8ball", "8b"],
    description: "Answers even your toughest questions.",
    usage: "(question)",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}