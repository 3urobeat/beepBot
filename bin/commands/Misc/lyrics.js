module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line  
    if (!args[0]) return message.channel.send(lang.cmd.othermisc.lyricsmissingargs)

    const msg = await message.channel.send(lang.cmd.othermisc.lyricssearching)

    try {
        let { body } = await require("superagent").get('https://some-random-api.ml/lyrics?title=' + args.join(" "))

        if (body.error) { //Error? What a bummer
            if (body.error == "Sorry I couldn't find that song's lyrics") {
                return message.channel.send(lang.cmd.othermisc.lyricsnotfound) //just didn't find anything
            } else { //oh shit other problem
                msg.edit(`API ${lang.general.error}: ${body.error}`)
                logger("error", "lyrics.js", "Error: " + body.error)
                return;
            }
        }

        var str = body.lyrics;

        if (str.length < 6000) {
            var fullmsg = { 
                content: "** **",
                embeds: [{
                    title: `${body.author} - ${body.title}`,
                    url: body.links.genius,
                    thumbnail: { url: body.thumbnail.genius },
                    description: str.slice(0, 2048),
                    fields: [],
                    timestamp: message.createdAt,
                    footer: {
                        text: `${lang.general.poweredby} some-random-api.ml & genius.com`
                    },
                    color: fn.randomhex()
                }] 
            }

            //longer than description character limit? field limits: https://birdie0.github.io/discord-webhooks-guide/other/field_limits.html
            if (str.length > 2048) fullmsg.embeds[0].fields.push({ name: "** **", value: str.slice(2048, 3072) })
            if (str.length > 3072) fullmsg.embeds[0].fields.push({ name: "** **", value: str.slice(3072, 4096) })
            if (str.length > 4096) fullmsg.embeds[0].fields.push({ name: "** **", value: str.slice(4096, 5120) })
            if (str.length > 5120) fullmsg.embeds[0].fields.push({ name: "** **", value: str.slice(5120, 899) })

            msg.edit(fullmsg)
        } else {
            msg.edit(`${lang.cmd.othermisc.lyricslongerthan6000}\n${body.links.genius}`) //longer than 6000? then just display message with link
        }

    } catch (err) {
        logger("error", "lyrics.js", "API Error: " + err)
        msg.edit(`API ${lang.general.error}: ${err}`)
    }
}

module.exports.info = { //Note to self: If you add more restrictions you need to add them to the restrictions field in the help cmd!
    names: ["lyrics", "l"], //Array<String> with all aliases
    description: "cmd.othermisc.lyricsinfodescription",
    usage: "(song name)",
    accessableby: ['all'], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false
}