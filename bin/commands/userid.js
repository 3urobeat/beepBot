module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (args[0] === undefined) {
        var usermentionid = message.author

        message.channel.send(message.author + " Your :id: is: " + usermentionid.id)
    } else {
        if (message.channel.type == "dm") {
            message.channel.send(v.dmerror())
            return;
        }         
        var usermentionid = message.mentions.members.first().user

        message.channel.send(message.author + " The :id: of the user " + usermentionid.username + "#" + usermentionid.discriminator + " is: " + usermentionid.id)       
    }

}

module.exports.config = {
    command: "id",
    alias: "userid"
}