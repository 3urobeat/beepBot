module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    try {
        if (!args[0]) return message.channel.send(lang)

        let { body } = await require("superagent").get(`http://urbanscraper.herokuapp.com/define/${args.join(" ")}`)
        let bodyurl = body.url.replace(/\s/g, '')

        message.channel.send({
            embeds: [{
                title: body.term.charAt(0).toUpperCase() + body.term.slice(1) + " - Urban Dictionary",
                url: bodyurl,
                color: fn.randomhex(),
                description: "** **", //Produces an empty field which looks better
                fields: [
                    {
                        name: lang.cmd.othermisc.uddefinition,
                        value: `** **\n${body.definition}` },
                    {
                        name: `${lang.general.example}:`,
                        value: `** **\n${body.example}` }
                ],
                footer: {
                    text: `${lang.general.by} ${body.author}`
                },
                timestamp: body.posted
            }]
        })
        
    } catch (err) {
        if (err == "Error: Not Found") return message.channel.send(lang.cmd.othermisc.udnotfound); //Send custom error message that nothing has been found about this search term

        logger("error", "urbandictionary.js", "API Error: " + err)
        message.channel.send(`urbandictionary API ${lang.general.error}: ${err}`)
    }
    
}

module.exports.info = {
    names: ["urban", "urbandictionary", "ud"],
    description: "cmd.othermisc.udinfodescription",
    usage: "(Search word)",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}