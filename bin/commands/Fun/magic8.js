module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    if (!args[0]) return message.channel.send(lang.cmd.otherfun.magic8missingargs)
    message.channel.send(":8ball: " + fn.randomstring(lang.cmd.otherfun.magic8responses))
}

module.exports.info = {
    names: ["magic8", "8ball", "8b"],
    description: "Answers even your toughest questions.",
    usage: "(question)",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}