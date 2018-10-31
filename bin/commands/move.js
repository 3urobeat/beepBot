module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const fs = v.fs
    
    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return;
    }

    try {
        let moveMember = message.guild.member(message.mentions.members.first())
        let channel = message.guild.channels.find(channel => channel.name === args.slice(1).join(" "))

        if (message.mentions.users.size === 0) { message.channel.send("Please mention a valid user!"); return; }
        if (channel.id === undefined) { message.channel.send("Please provide a valid channel name!"); return; }
        if (!moveMember.voiceChannel) { message.channel.send("The mentioned user is not in a voice channel!"); return; }
        if (moveMember.voiceChannel.id === channel.id) { message.channel.send("The mentioned user is already in that channel!"); return; }
    
        if (message.member.permissions.has("MOVE_MEMBERS", "ADMINISTRATOR")) {
            moveMember.setVoiceChannel(channel.id).catch(err => {
                message.channel.send("Error: " + err)
            })
            await message.channel.send("Moved **" + moveMember.user.username + "** to **" + channel.name + "**!")
        } else {
            message.channel.send(v.usermissperm())
        }
    } catch (err) {
        message.channel.send("Error: " + err)
    }
}

module.exports.config = {
    command: "move"
}