module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    var https = require('https');

    var options = {
        hostname: 'icanhazdadjoke.com',
        port: 443,
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    }

    var req = https.request(options, res => {
        res.on("data", (data) => {
            message.channel.send(JSON.parse(data).joke);
        })
    })

    req.on('error', (err) => {
        logger("error", "joke.js", "API Error: " + err)
        message.channel.send(`icanhazdadjoke.com API ${lang.general.error}: ${err}`) 
    })
        
    req.end()
}

module.exports.info = {
    names: ["joke", "dadjoke", "jokes"],
    description: "cmd.otherfun.jokeinfodescription",
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}