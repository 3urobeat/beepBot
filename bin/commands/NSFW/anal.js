module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    try {
        let { body } = await require("superagent").get('https://nekobot.xyz/api/image?type=anal')

        message.channel.send({embed:{
            title: lang.general.imagehyperlink,
            url: body.message,
            image: {
                url: body.message },
            footer: {
                text: `${lang.general.poweredby} NekoBot API` },
            timestamp: message.createdAt,
            color: fn.randomhex() } })
    } catch (err) {
        logger("error", "anal.js", "API Error: " + err)
        message.channel.send(`nekobot.xyz anal API ${lang.general.error}: ${err}`) }
}

module.exports.info = {
    names: ["anal"],
    description: "Posts anal porn pictures.",
    usage: "",
    accessableby: ['all'], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: true
}