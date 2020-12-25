module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    try {
        let { body } = await v.superagent.get('http://api.oboobs.ru/boobs/0/1/random')
        
        let imageurl = "http://media.oboobs.ru/" + body[0].preview
        message.channel.send({embed:{
            title: lang.general.imagehyperlink,
            url: imageurl,
            image: {
                url: imageurl },
            footer: {
                icon_url: message.author.displayAvatarURL,
                text: "Requestet by " + message.author.username },
            timestamp: message.createdAt,
            color: v.randomhex() } })

    } catch (err) {
        logger("error", "boobs.js", "API Error: " + err)
        message.channel.send("boobs API Error: " + err) }
}

module.exports.info = {
    names: ["boobs", "tits"],
    description: "Posts porn pictures of boobs. (NSFW)",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: true
}