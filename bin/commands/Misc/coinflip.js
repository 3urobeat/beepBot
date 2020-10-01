module.exports.run = async (bot, message, args, lang) => {
    const v = require("../../vars.js")
    var logger = v.logger
    
    message.channel.send(`${lang.coinflipped} **${v.randomstring(lang.coinfliprandommsg)}**!`)
}

module.exports.aliases = {
    1: "coinflip",
    2: "coin",
    3: "flip"
}
module.exports.info = {
    name: "coinflip",
    description: "Flips a coin.",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false,
    aliases: this.aliases
}