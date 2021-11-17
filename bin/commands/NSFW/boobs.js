module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    try {
        //Note: If this API shouldn't work anymore, use nekobot: https://nekobot.xyz/api/image?type=boobs
        let { body } = await require("superagent").get('http://api.oboobs.ru/boobs/0/1/random')
        
        let imageurl = "http://media.oboobs.ru/" + body[0].preview
        message.channel.send({embeds: [{
            title: lang.general.imagehyperlink,
            url: imageurl,
            image: {
                url: imageurl },
            footer: {
                text: `${lang.general.poweredby} api.oboobs.ru` },
            timestamp: message.createdAt,
            color: fn.randomhex() }]
        })

    } catch (err) {
        logger("error", "boobs.js", "API Error: " + err)
        message.channel.send(`api.oboobs.ru boobs API ${lang.general.error}: ${err}`) }
}

module.exports.info = {
    names: ["boobs", "tits"],
    description: "cmd.othernsfw.boobsinfodescription",
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: true
}