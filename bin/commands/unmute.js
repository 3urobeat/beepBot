module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const fs = v.fs
    
    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return;
    }
    let unmuteMember = message.guild.member(message.mentions.members.first());
    if (message.mentions.users.size === 0) { message.channel.send("Please mention a valid user!"); return; }
    if (unmuteMember.id == message.author.id) { message.channel.send("You can't unmute yourself. :facepalm:"); return; }
    if (message.guild.owner.id !== message.author.id) {
        if (unmuteMember.highestRole.position >= message.member.highestRole.position) { message.channel.send("You cannot unmute a member who is higher or has the same role as you."); return; }}
    
    if (message.member.permissions.has("MUTE_MEMBERS", "ADMINISTRATOR")) {

        let unmutetype = args[0].toLowerCase()

        if (unmutetype === "chat") {
            if (!unmuteMember.roles.has(message.guild.roles.find(role => role.name === "beepBot Muted").id)) {
                message.channel.send(unmuteMember.user.username + " is not chat-muted.")
                return;
            }

            chatunmute();
            await message.channel.send(unmuteMember + " was chat-unmuted.")

        } else if (unmutetype === "voice") {
            if (!unmuteMember.voiceChannel) {
                message.channel.send("I can't unmute someone who is not in a voice channel...")
                return; }
            if (unmuteMember.serverMute === false) {
                message.channel.send(unmuteMember.user.username + " is not voice-muted.")
                return;
            }

            voiceunmute();
            await message.channel.send(unmuteMember + " was voice-unmuted.")

        } else if (unmutetype === "all") {
            if (!unmuteMember.roles.has(message.guild.roles.find(role => role.name === "beepBot Muted").id)) {
                message.channel.send(unmuteMember.user.username + " is not chat-muted.")
            } else {
                chatunmute();
                await message.channel.send(unmuteMember + " was chat-unmuted.")
            }

            if (unmuteMember.serverMute === false) {
                message.channel.send(unmuteMember.user.username + " is not voice-muted.")
                return;
            } else {
                if (!unmuteMember.voiceChannel) {
                    message.channel.send("I can't unmute someone who is not in a voice channel...")
                } else {
                    voiceunmute();
                    await message.channel.send(unmuteMember + " was voice-unmuted.")
                }
            }

        } else {
            message.channel.send("Please define where the user should be unmuted `chat|voice|all`!")
            return;
        }

    } else {
        message.channel.send(v.usermissperm())
    }

    async function chatunmute() {
        let role = message.guild.roles.find(r => r.name === "beepBot Muted")
        if (!role) {
            message.channel.send("The 'beepBot Muted' role does not exist on this server.")
            return;
        }
        await unmuteMember.removeRole(role.id)
        
        delete v.bot.chatmutes[unmuteMember.id];
        v.fs.writeFile(v.chatmutespath, JSON.stringify(v.bot.chatmutes), err => {
            if (err) console.log("unmute remove chatmute from file Error: " + err)
        })
    }

    async function voiceunmute() {
        unmuteMember.setMute(false).then(member => {
            }).catch(err => {
                message.channel.send("An error occured: " + err)
            })
        delete v.bot.voicemutes[unmuteMember.id];
        v.fs.writeFile(v.voicemutespath, JSON.stringify(v.bot.voicemutes), err => {
            if (err) message.channel.send("unmute remove voicemute from file Error: " + err)
        })
    }


}

module.exports.config = {
    command: "unmute"
}