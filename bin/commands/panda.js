module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    try {
        const { body } = await v.superagent
        .get('https://some-random-api.ml/pandaimg')
        message.channel.send(body.link)
    } catch (err) {
        console.log("Panda API Error: " + err)
        message.channel.send("Panda API Error: " + err)
    }

    }

module.exports.config = {
    command: "panda"
}