module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    try {
        let { body } = await require("superagent").get('https://nekobot.xyz/api/image?type=pussy')

        message.channel.send({embed:{
            title: lang.general.imagehyperlink,
            url: body.message,
            image: {
                url: body.message },
            footer: {
                icon_url: message.author.displayAvatarURL,
                text: `${lang.general.poweredby} NekoBot API` },
            timestamp: message.createdAt,
            color: fn.randomhex() } })
        
    } catch (err) {
        logger("error", "pussy.js", "API Error: " + err)
        message.channel.send(`nekobot.xyz pussy API ${lang.general.error}: ${err}`) }
}

module.exports.info = {
    names: ["pussy", "pussies"],
    description: "Posts porn pictures of pussies. (NSFW)",
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: true
}