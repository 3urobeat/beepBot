module.exports.run = async (bot, message, args, lang, v, logger) => {
    var avataruser = v.getuserfrommsg(message, args, true)
    if (Object.keys(avataruser).length == 0) return message.channel.send(lang.general.usernotfound)

    var avatarurl = avataruser.displayAvatarURL()
    message.channel.send({embed:{
        author:{
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
        color: v.randomhex()
    }})
}

module.exports.info = {
    names: ["avatar", "useravatar"],
    description: "Displays a link to your avatar or of the user you mentioned.",
    usage: "[mention/username/userid]",
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false
}