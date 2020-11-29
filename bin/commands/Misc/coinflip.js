module.exports.run = async (bot, message, args, lang, v, logger) => {   
    message.channel.send(`${lang.cmd.othermisc.coinflipped} **${v.randomstring(lang.cmd.othermisc.coinfliprandommsg)}**!`)
}

module.exports.info = {
    names: ["coinflip", "coin", "flip"],
    description: "Flips a coin.",
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}