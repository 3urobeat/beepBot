module.exports.run = async (bot, message, args, lang, v, logger) => {
    try {
        let { body } = await v.superagent.get('https://nekobot.xyz/api/image?type=anal')

        message.channel.send({embed:{
            title: lang.general.imagehyperlink,
            url: body.message,
            image: {
                url: body.message },
            footer: {
                icon_url: message.author.displayAvatarURL,
                text: "Requestet by " + message.author.username },
            timestamp: message.createdAt,
            color: v.randomhex() } })
    } catch (err) {
        logger("error", "anal.js", "API Error: " + err)
        message.channel.send("nekobot.xyz anal API Error: " + err) }
}

module.exports.info = {
    names: ["anal"],
    description: "Posts anal porn pictures.",
    usage: "",
    accessableby: ['all'], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: true
}