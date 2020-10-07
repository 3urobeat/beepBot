module.exports.run = async (bot, message, args, lang) => {
    const v      = require("../../vars.js")
    const logger = v.logger

    try {
        let { body } = await v.superagent.get('https://nekobot.xyz/api/image?type=4k')

        message.channel.send({embed:{
            title: "Image doesn't load? Click here!",
            url: body.message,
            image: {
                url: body.message },
            footer: {
                icon_url: message.author.displayAvatarURL,
                text: `Requestet by ${message.author.username}` },
            timestamp: message.createdAt,
            color: v.randomhex() }})

    } catch (err) {
        logger("error", "4k.js", "API Error: " + err)
        message.channel.send("nekobot.xyz 4k API Error: " + err) }
}

module.exports.info = {
    names: ["4k"],
    description: "Posts 4k porn pictures. (NSFW)",
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: true
}