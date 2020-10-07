module.exports.run = async (bot, message, args, lang) => {
    const v      = require("../../vars.js")

    message.channel.send(`${String(lang.paidrespects).replace("username", `**${message.author.username}**`)} ${v.bot.guilds.cache.get("232550371191554051").emojis.cache.find(emoji => emoji.name === "paidrespects")}`)
}

module.exports.info = {
    names: ["f"],
    description: "Press F to pay respects",
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}