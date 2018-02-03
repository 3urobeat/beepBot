module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    if (v.botconfig.musicenable === "false") {
        message.channel.send("The music command is disabled due to heavy malfunction. :expressionless: ")
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

    if (message.channel.type == "dm") {
        message.channel.send("You have to execute this command on a server!")
        return; }
    if (v.os.platform == "linux") {
        message.channel.send("The music feature is due to extreme lags disabled when running on my Raspberry Pi. :confused:")
        return; }
    if (!args.slice(0).join(" ")) {
        message.channel.send("Please provide a valid link.");
        return; }
    if (!message.content.includes("https://www.yout")) {
        message.channel.send("Please provide a valid link.");
        return; }
    if (!message.member.voiceChannel) {
        message.channel.send("Please join a voice channel first.");
        return; }
    if (message.member.voiceChannel.full) {
        message.channel.send("Your voice channel is full!");
        return; }
    if (!message.member.voiceChannel.joinable) {
        message.channel.send("Missing permission to join your voice channel!");
        return; }
    if (!message.member.voiceChannel.speakable) {
        message.channel.send("Halp! I can't speak!");
        return; }        
    if(!v.servers[message.guild.id]) v.servers[message.guild.id] = {
        queue: []
    };

    var server = v.servers[message.guild.id];
    server.queue.push(args.slice(0).join(" "));
    if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
        play(connection, message)

        });        
    if (!message.guild.voiceConnection) {
        v.YTDL.getInfo(args.slice(0).join(" "), function(err, info) {
            message.channel.send("Now playing: `" + info.title + " (" + info.length_seconds + " seconds)" + " by " + info.author + " with " + info.view_count + " Views `").catch(err => {
                message.channel.send("Error: " + err)
            })
        });
        } else {
            v.YTDL.getInfo(args.slice(0).join(" "), function(err, info) {
                message.channel.send("Added to queue: `" + info.title + " (" + info.length_seconds + " seconds)" + " by " + info.author + " with " + info.view_count + " Views `").catch(err => {
                    message.channel.send("Error: " + err)
                })
            });
        }
}


module.exports.config = {
    command: "play"
}