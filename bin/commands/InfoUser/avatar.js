module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    var avataruser = fn.getuserfrommsg(message, args, 0, null, true);
    if (!avataruser) return message.channel.send(lang.general.usernotfound)
    if (typeof (avataruser) == "number") return message.channel.send(lang.general.multipleusersfound.replace("useramount", avataruser))

    var avatarurl = avataruser.displayAvatarURL()
    message.channel.send({ embeds: [{
        author: {
            name: avataruser.username,
            icon_url: avatarurl,
            url: avatarurl
        },
        title: "Click here to open image in your browser",
        url: avatarurl,
        image: {
            url: avatarurl
        },
        footer:{
            icon_url: message.author.displayAvatarURL,
            text: `${lang.general.requestedby} ${message.author.username}`
        },
        timestamp: message.createdAt,
        color: fn.randomhex() 
    }] })
}

module.exports.info = {
    names: ["avatar", "useravatar"],
    description: "cmd.otherinfouser.avatarinfodescription",
    usage: "[mention/username/userid]",
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false
}