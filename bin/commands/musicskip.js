module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.channel.type == "dm") {
        message.channel.send(v.randomstring(v.dmerror))
        return;
    }
    if (!message.guild.voiceConnection) {
        message.channel.send("The bot is not connected to a voice channel.")
        return;
    }
    if (!message.member.voiceChannel) {
        message.channel.send("Please join a voice channel first.");
        return; }
    if (message.guild.voiceConnection && message.member.voiceChannel) if (message.member.voiceChannel.id != message.guild.voiceConnection.channel.id) {
        message.channel.send("The bot is not in your voice channel!") 
        return; }
    
    var server = v.servers[message.guild.id];
    if (server.dispatcher) server.dispatcher.end();

}

module.exports.config = {
    command: "skip"
}