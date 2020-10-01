module.exports.run = async (bot, message, args, lang) => {
    const v = require("../../vars.js")
    
    function avatar() {
        var avatarurl = avatarmention.displayAvatarURL()
        message.channel.send({embed:{
            author:{
                name: avatarmention.username,
                icon_url: avatarurl,
                url: avatarurl
            },
            description: avatarurl,
            image: {
                url: avatarurl
            },
            footer:{
                icon_url: message.author.displayAvatarURL,
                text: `${lang.requestedby} ${message.author.username}`
            },
            timestamp: message.createdAt,
            color: v.randomhex()
        }}) }

    if (!message.mentions.users.first()) {
        var avatarmention = message.author
        avatar();
    } else {
        var avatarmention = message.mentions.users.first()
        avatar(); }
}

module.exports.aliases = {
    1: "avatar",
    2: "useravatar"
}
module.exports.info = {
    name: "avatar",
    description: "Displays a link to your avatar or of the user you mentioned.",
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false,
    aliases: this.aliases
}