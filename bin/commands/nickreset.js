module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return;
    }
    let nickmentionreset = message.mentions.users.first()
    if (message.mentions.users.size === 0) {
        if (message.member.permissions.has("CHANGE_NICKNAME", "ADMINISTRATOR")) {
            message.guild.members.get(message.author.id).setNickname(message.author.username).catch(err => {
                message.channel.send("Error: " + err)
                return;
            });
            await message.channel.send("Changed your nickname back to normal.")
            return;
        } else {
            message.channel.send("You don't have permission to change your username. :confused:")
            return;
        }
        return;
    }
    if (message.member.permissions.has("MANAGE_NICKNAMES", "ADMINISTRATOR")) {
        message.guild.members.get(nickmentionreset.id).setNickname(nickmentionreset.username).catch(err => {
            message.channel.send("Error: " + err)
        })
        message.channel.send("Removed nickname of " + nickmentionreset + ".")
        return;
    } else {
        message.channel.send(v.usermissperm())
    }

}

module.exports.config = {
    command: "nickreset"
}