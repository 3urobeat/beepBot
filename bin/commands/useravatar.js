module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.mentions.users.first() === undefined) {
        var avatarmention = message.author
        avatar();
    } else {
        var avatarmention = message.mentions.users.first()
        if (message.channel.type == "dm") {
            message.channel.send("Can't get a avatar from someone else in a dm! :no_good:")
            return; }
        if (avatarmention.avatarURL === null) {
            message.channel.send(message.author + " The user " + avatarmention + " has no custom avatar.")
            return; }
        avatar();
    }

    function avatar() {
        message.channel.send({embed:{
            author:{
                name: avatarmention.username,
                icon_url: avatarmention.avatarURL,
                url: message.member.user.avatarURL
            },
            description: avatarmention.avatarURL,
            image: {
                url: avatarmention.avatarURL
            },
            footer:{
                icon_url: message.author.avatarURL,
                text: "Requestet by " + message.author.username
            },
            color: v.randomhex()
        }})
    }

}

module.exports.config = {
    command: "avatar",
    alias: "useravatar"
}