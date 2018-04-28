module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.channel.type == "dm") {
        message.channel.send(v.randomstring(v.dmerror))
        return;
    }
    if (!message.member.voiceChannel) {
        message.channel.send("Please join a voice channel first.");
        return; }
    if (message.guild.voiceConnection && message.member.voiceChannel) if (message.member.voiceChannel.id != message.guild.voiceConnection.channel.id) {
        message.channel.send("The bot is not in your voice channel!") 
        return; }

    var server = v.servers[message.guild.id];

    if (!message.member.voiceChannel) message.channel.send("Nothing to stop here. :o")
    if (!message.guild.voiceConnection) message.channel.send("The Bot is not playing anything...");
    
    if (message.member.voiceChannel) {
        if (message.guild.voiceConnection) {
            if (message.guild.voiceConnection.channel.id === message.member.voiceChannel.id) {
//                    message.channel.send("Stopped music and left voice channel."); //Function "play" already sends a message
                message.guild.voiceConnection.disconnect();
            } else {
                message.channel.send("The Bot is not in your voice channel!");
                return;
            }
        }
    }

}

module.exports.config = {
    command: "stop"
}