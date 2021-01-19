module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    message.channel.send(`${lang.cmd.othermisc.coinflipped} **${fn.randomstring(lang.cmd.othermisc.coinfliprandommsg)}**!`)
}

module.exports.info = {
    names: ["coinflip", "coin", "flip"],
    description: "cmd.othermisc.coinflipinfodescription",
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}