module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    try {
        const { body } = await v.superagent
        .get('https://some-random-api.ml/birbimg')
        message.channel.send(body.link)
    } catch (err) {
        console.log("Birb API Error: " + err)
        message.channel.send("Birb API Error: " + err)
    }

    }

module.exports.config = {
    command: "birb",
    alias: "bird",
    alias2: "yos"
}