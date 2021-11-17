module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    try {
        //Note: If this API shouldn't work anymore, use nekobot: https://nekobot.xyz/api/image?type=ass
        let { body } = await require("superagent").get('http://api.obutts.ru/butts/0/1/random')

        let imageurl = "http://media.obutts.ru/" + body[0].preview
        message.channel.send({embeds: [{
            title: lang.general.imagehyperlink,
            url: imageurl,
            image: {
                url: imageurl },
            footer: {
                text: `${lang.general.poweredby} api.obutts.ru` },
            timestamp: message.createdAt,
            color: fn.randomhex() }]
        })

    } catch (err) {
        logger("error", "butts.js", "API Error: " + err)
        message.channel.send(`api.obutts.ru butts API ${lang.general.error}: ${err}`) }
}

module.exports.info = {
    names: ["butts", "butt", "ass"],
    description: "cmd.othernsfw.buttsinfodescription",
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: true
}