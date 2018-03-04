module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    try {
        const { body } = await v.superagent
        .get('https://random.cat/meow')
        message.channel.send(body.file)
    } catch (err) {
        console.log("Cat API Error: " + err)
        message.channel.send("Cat API Error: " + err)
    }

}

module.exports.config = {
    command: "cat",
    alias: "meow"
}