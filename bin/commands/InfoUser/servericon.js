module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    if (!message.guild.iconURL()) return message.channel.send(lang.cmd.otherinfouser.servericonnoicon)

    let iconurl = message.guild.iconURL()

    message.channel.send({embed: {
        title: lang.cmd.otherinfouser.servericontitle,
        url: iconurl,
        color: fn.randomhex(),
        image: { url: iconurl },
        footer: { 
            icon_url: message.author.displayAvatarURL,
            text: `${lang.general.requestedby} ${message.author.username}`},
        timestamp: message.createdAt
    } })
}

module.exports.info = {
    names: ["servericon"],
    description: "Displays the icon of this server and a link to it.",
    usage: "",
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false
}