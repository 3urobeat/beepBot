module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return; }
    if (message.guild.iconURL === null) {
        message.channel.send(message.author + " This server does not have an custom icon. :neutral_face:")
        return; }
    
    var imageurl = message.guild.iconURL
    message.channel.send({embed:{
        title: imageurl,
        image: {
            url: imageurl
        },
        footer:{
            icon_url: message.author.displayAvatarURL,
            text: "Requestet by " + message.author.username
        },
        timestamp: message.createdAt,
        color: v.randomhex()
    }})

}

module.exports.config = {
    command: "servericon",
    alias: "serveravatar"
}