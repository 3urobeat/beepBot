module.exports.run = async (bot, message, args, lang) => {
    const v = require("../../vars.js")
    var logger = v.logger
 
    try {
        let { body } = await v.superagent.get('http://api.obutts.ru/butts/0/1/random')

        let imageurl = "http://media.obutts.ru/" + body[0].preview
        message.channel.send({embed:{
            title: "Image doesn't load? Click here!",
            url: imageurl,
            image: {
                url: imageurl },
            footer: {
                icon_url: message.author.displayAvatarURL,
                text: "Requestet by " + message.author.username },
            timestamp: message.createdAt,
            color: v.randomhex() } })

    } catch (err) {
        logger("butts API Error: " + err)
        message.channel.send("butts API Error: " + err) }
}

module.exports.aliases = {
    1: "butts",
    2: "ass"
}
module.exports.info = {
    name: "butts",
    description: "Posts porn pictures of butts. (NSFW)",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: true,
    aliases: this.aliases
}