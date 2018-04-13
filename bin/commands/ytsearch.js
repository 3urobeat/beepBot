module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    try {

        if (args[0] === undefined) {
            message.channel.send("Please provide a valid argument to search!")
            return;
        }

        var kind = "video"
        var searchword = args.slice(0).join(" ")
        var maxResults = "1"
        var safeSearch = "none"
        var key = "AIzaSyBYOgEG_8iYu3XP6DgDqSH_ErCE93egTQQ"

        const { body } = await v.superagent
        .get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + searchword + '&type=' + kind + '&maxResults=' + maxResults + '&safeSearch=' + safeSearch + '&key=' + key)

/*         console.log('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + searchword + '&type=' + kind + '&maxResults=' + maxResults + '&safeSearch=' + safeSearch + '&key=' + key) */

        if(body.pageInfo.totalResults < 1) {
            message.channel.send(":x: No results found.")
            return;
        }

        var youtubeurlid = body.items[0].id.videoId
        var item0 = body.items[0]

        if (item0.snippet.liveBroadcastContent === "live") {
            var isLive = ":red_circle: Livestream"
        } else {
            var isLive = "** **"
        }

        message.channel.send({embed:{
            title: item0.snippet.title + " - YouTube",
            url: "https://www.youtube.com/watch?v=" + youtubeurlid,
            color: 0xFF0000,
            thumbnail: {
                url: item0.snippet.thumbnails.high.url
            },
            description: isLive,
            fields: [
                {
                    name: "Description:",
                    value: "** **\n" + item0.snippet.description + "\n** **"
                }
            ],
            footer: {
                text: "by " + item0.snippet.channelTitle
                },
            timestamp: item0.snippet.publishedAt

        }}).catch(err => {
            message.channel.send("Error sending message: " + err)
            console.log("ytsearch sending message Error: " + err)
            return;
        })

        message.channel.send("https://www.youtube.com/watch?v=" + youtubeurlid)

    } catch (err) {
        console.log("ytsearch YouTube API Error: " + err)
        message.channel.send("YouTube API Error: " + err)
    }

}

module.exports.config = {
    command: "ytsearch"
}