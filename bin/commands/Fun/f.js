module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    message.channel.send(`${String(lang.cmd.otherfun.paidrespects).replace("username", `**${message.author.username}**`)} <:paidrespects:763023492521656330>`)
}

module.exports.info = {
    names: ["f"],
    description: "Press F to pay respects",
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}