module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    if (!message.guild.iconURL()) return message.channel.send(lang.cmd.otherinfouser.servericonnoicon)

    let iconurl = message.guild.iconURL();

    message.channel.send({
        embeds: [{
            title: lang.cmd.otherinfouser.servericontitle,
            url: iconurl,
            color: fn.randomhex(),
            image: { url: iconurl },
            footer: { 
                icon_url: message.author.displayAvatarURL,
                text: `${lang.general.requestedby} ${message.author.username}`
            },
            timestamp: message.createdAt
        }]
    })
}

module.exports.info = {
    names: ["servericon"],
    description: "cmd.otherinfouser.servericoninfodescription",
    usage: "",
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false
}