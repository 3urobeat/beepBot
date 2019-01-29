module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    try {
        const { body } = await v.superagent
        .get('https://some-random-api.ml/redpandaimg')
        message.channel.send(body.link)
    } catch (err) {
        console.log("RedPanda API Error: " + err)
        message.channel.send("RedPanda API Error: " + err)
    }

    }

module.exports.config = {
    command: "redpanda"
}