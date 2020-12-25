module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    message.channel.send(`${String(lang.cmd.otherfun.paidrespects).replace("username", `**${message.author.username}**`)} ${bot.guilds.cache.get("232550371191554051").emojis.cache.find(emoji => emoji.name === "paidrespects")}`)
}

module.exports.info = {
    names: ["f"],
    description: "Press F to pay respects",
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}