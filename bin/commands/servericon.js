module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return; }
    if (message.guild.iconURL === null) {
        message.channel.send(message.author + " This server does not have an custom icon. :neutral_face:")
        return; }
    message.channel.send(message.author + "\n" + message.guild.iconURL);

}

module.exports.config = {
    command: "servericon",
    alias: "serveravatar"
}