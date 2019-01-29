module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    try {
        const { body } = await v.superagent
        .get('https://some-random-api.ml/foximg')
        message.channel.send(body.link)
    } catch (err) {
        console.log("Fox API Error: " + err)
        message.channel.send("Fox API Error: " + err)
    }

    }

module.exports.config = {
    command: "fox"
}