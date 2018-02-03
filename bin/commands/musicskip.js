module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    if (v.botconfig.musicenable === "false") {
        message.channel.send("The music command is disabled due to heavy malfunction. :expressionless: ")
        return;
    }
    
    if (message.channel.type == "dm") {
        message.channel.send(v.randomstring(v.dmerror))
        return;
    }
    function play(connection, message) {
        var server = v.servers[message.guild.id];
    
        server.dispatcher = connection.playStream(v.YTDL(server.queue[0], {filter: "audioonly"}));
        server.queue.shift();
        server.dispatcher.on("end", function() {
            if (server.queue[0]) {
                play(connection, message)
                message.channel.send("Playing next song...")
            } else { 
            connection.disconnect();
            message.channel.send("Stopped music and left voice channel.")
            }
        });
    }
    
    var server = v.servers[message.guild.id];
    if (server.dispatcher) server.dispatcher.end();

}

module.exports.config = {
    command: "skip"
}