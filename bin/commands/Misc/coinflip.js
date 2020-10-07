module.exports.run = async (bot, message, args, lang) => {
    const v      = require("../../vars.js")
    const logger = v.logger
    
    message.channel.send(`${lang.coinflipped} **${v.randomstring(lang.coinfliprandommsg)}**!`)
}

module.exports.info = {
    names: ["coinflip", "coin", "flip"],
    description: "Flips a coin.",
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}