module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {    
    try {
        let { body } = await require("superagent").get('https://nekobot.xyz/api/image?type=pgif')

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
        logger("error", "pgif.js", "API Error: " + err)
        message.channel.send(`nekobot.xyz pgif API ${lang.general.error}: ${err}`) }
}

module.exports.info = {
    names: ["pgif", "porngif"],
    description: "Posts porn gifs. (NSFW)",
    usage: "",
    accessableby: ['all'], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: true
}