module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    if (v.botconfig.musicenable === "false") {
        message.channel.send("The music command is disabled. :expressionless: ")
        return;
    }
    
    if (message.channel.type == "dm") {
        message.channel.send(v.randomstring(v.dmerror))
        return;
    }
    if (!message.guild.voiceConnection) {
        message.channel.send("The bot is not connected to a voice channel.")
        return;
    }
    if (message.guild.voiceConnection) if (message.member.voiceChannel.id != message.guild.voiceConnection.channel.id) {
        message.channel.send("The bot is not in your voice channel!")
        return; }
    
    var volume = args[0]

    if (volume === undefined) {
        message.channel.send("Please provide a number. 1 is default.")
        return;
    }

    var server = v.servers[message.guild.id];
    server.dispatcher.setVolume(volume)
    message.channel.send("Set volume to " + volume)

}

module.exports.config = {
    command: "vol",
    alias: "volume"
}