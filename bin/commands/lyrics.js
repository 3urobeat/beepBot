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

        const msg = await message.channel.send("`Loading...`")

        if (body.error) {
            message.channel.send(body.error)
            return;
        }
        var str = body.lyrics;

        if (str.length < 2000) {
            message.channel.send({embed:{
                color: 65280,
                description: str,
                timestamp: message.createdAt,
                footer: {
                    text: "Requested by " + message.author.username,
                    icon_url: message.author.displayAvatarURL
                },
            }})
            return;
        }

        var textbeensend = 0;

        for(let i = 0; i < str.length; i += 2000) {
            var counter = counter + 1;
            const lyricstext = str.substring(i, Math.min(str.length, i + 2000));

            if (counter == 1) {
                //edit loading msg with title
                msg.edit({embed:{
                    title: "Lyrics for " + body.title + ":",
                    url: body.links.genius,
                    description: lyricstext,
                    thumbnail: {
                        url: body.thumbnail.genius
                    },
                    color: 65280,
                }})
                var textbeensend = lyricstext.length;
            } else {
                if (lyricstext.length >= textbeensend) {
                    //post new message without footer and without title
                    message.channel.send({embed:{
                        color: 65280,
                        description: lyricstext,
                    }})
                    var textbeensend = lyricstext.length;
                } else {
                    //post new message with footer but without title
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