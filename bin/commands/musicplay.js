module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    function play(connection, message) {
        var server = v.servers[message.guild.id];
    
        server.dispatcher = connection.playStream(v.YTDL(server.queue[0], { audioonly: true }));
        server.queue.shift();
        server.dispatcher.on("end", function() {
            if (server.queue[0]) {
                v.YTDL.getInfo(server.queue[0], function(err, info) {
                    message.channel.send("Now playing: `" + info.title + " (" + info.length_seconds + " seconds)" + " by " + info.author.name + " with " + info.view_count + " Views `").catch(err => {
                        message.channel.send("Error: " + err)
                    })
                });
                play(connection, message)
                server.dispatcher.setVolume(server.volume)
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
    if (!message.member.voiceChannel) {
        message.channel.send("Please join a voice channel first.");
        return; }
    if (message.guild.voiceConnection && message.member.voiceChannel) if (message.member.voiceChannel.id != message.guild.voiceConnection.channel.id) {
        message.channel.send("The bot is not in your voice channel!") 
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
        queue: [] }
    

    //search
    try {
        if (!message.content.includes("https://www.yout")) {

            var searchword = args.slice(0).join(" ")
            message.channel.send("Searching for `" + searchword + "`...");
            
            var kind = "video"
            var searchword = args.slice(0).join(" ")
            var maxResults = "1"
            var safeSearch = "none"
            var key = v.tokenpath.youtubeapikey

            const { body } = await v.superagent
            .get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + searchword + '&type=' + kind + '&maxResults=' + maxResults + '&safeSearch=' + safeSearch + '&key=' + key)

            if(body.pageInfo.totalResults < 1) {
                message.channel.send(":x: No results found.")
                return;
            }

            var youtubeurlid = body.items[0].id.videoId
        
            var urltoplay = "https://www.youtube.com/watch?v=" + youtubeurlid

        } else {
            var urltoplay = args.slice(0).join(" ")
            
        }
    } catch(err) {
        console.log("musicplay YouTube API Error: " + err)
        message.channel.send("YouTube API Error: " + err)
    }

    console.log(urltoplay)
    
    var server = v.servers[message.guild.id];

    server.queue.push(urltoplay);
    if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
        play(connection, message)
        });        

    v.YTDL.getInfo(urltoplay, function(err, info) {
        message.channel.send("Added to queue: `" + info.title + " (" + info.length_seconds + " seconds)" + " by " + info.author.name + "`").catch(err => {
            message.channel.send("Error: " + err)
        })
    });
}


module.exports.config = {
    command: "play"
}