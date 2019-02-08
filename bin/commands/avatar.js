module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.mentions.users.first() === undefined) {
        var avatarmention = message.author
        avatar();
    } else {
        var avatarmention = message.mentions.users.first()
        if (message.channel.type == "dm") {
            message.channel.send(v.dmerror())
            return; }
        avatar();
    }

    function avatar() {
        var avatarurl = avatarmention.displayAvatarURL
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
                text: "Requestet by " + message.author.username
            },
            timestamp: message.createdAt,
            color: v.randomhex()
        }})
    }

}

module.exports.config = {
    command: "avatar",
    alias: "useravatar"
}