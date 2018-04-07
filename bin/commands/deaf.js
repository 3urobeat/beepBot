module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const fs = v.fs
    
    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return;
    }
    let deafMember = message.guild.member(message.mentions.members.first());

    if (message.mentions.users.size === 0) { message.channel.send("Please mention a valid user!"); return; }
    if (deafMember.id == v.BOTID) { message.channel.send(v.randomstring(["I won't deaf myself what are you thinking?! :angry:","I don't like you anymore.","No. :angry:","Dont fight me with my own weapons!","Is there a way to block you?","Could someone kick this guy?"])); return; }
    if (deafMember.id == message.author.id) { message.channel.send("You can't deaf yourself. :facepalm:"); return; }
    if (message.guild.owner.id !== message.author.id) {
        if (deafMember.highestRole.position >= message.member.highestRole.position) { message.channel.send("You cannot deaf a member who is higher or has the same role as you."); return; }}

    if (message.member.permissions.has("DEAFEN_MEMBERS", "ADMINISTRATOR")) {

        if (!deafMember.voiceChannel) {
            message.channel.send("I can't deaf someone who is not in a voice channel...")
            return; }
        if (deafMember.serverDeaf === true) {
            deafMember.setDeaf(false)
            await message.channel.send(deafMember + " is not deaf anymore.") 
        } else {
            deafMember.setDeaf(true)
            await message.channel.send(deafMember + " is now deaf.")
        }

    } else {
        message.channel.send(v.usermissperm())
    }

}

module.exports.config = {
    command: "deaf"
}