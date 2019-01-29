module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    if (args[0] === undefined) {
        message.channel.send("Please provide a title!")
        return;
    }

    var title = args.slice(0).join(" ")
    var counter = 0;

    try {
        const { body } = await v.superagent
        .get('https://some-random-api.ml/lyrics?title=' + title)

        var str = body.lyrics;
        for(let i = 0; i < str.length; i += 2000) {
            var counter = counter + 1;
            const lyricstext = str.substring(i, Math.min(str.length, i + 2000));

            if (counter < 2) {
                message.channel.send({embed:{
                    title: "Lyrics for " + body.title + ":",
                    url: body.links.genius,
                    color: 65280,
                    thumbnail: {
                        url: body.thumbnail.genius
                    },
                    description: lyricstext,
                }})
            } else {
                message.channel.send({embed:{
                    color: 65280,
                    description: lyricstext,
                    timestamp: message.createdAt,
                    footer: {
                        text: "Requested by " + message.author.username,
                        icon_url: message.author.displayAvatarURL
                    },
                }})
            }
        }

    } catch (err) {
        message.channel.send("Lyric API Error: " + err)
        console.log("Lyric API Error: " + err)
        return;
    }
}

module.exports.config = {
    command: "lyrics",
    alias: "l",
    alias2: "songtext"
}