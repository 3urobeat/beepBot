module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    try {
        const { body } = await v.superagent
        .get('https://api.bunnies.io/v2/loop/random/?media=gif')
        message.channel.send(body.media.gif).catch(err => {
            console.log("bunny send link error: " + err)
        })
    } catch (err) {
        console.log("Bunny API Error: " + err)
        message.channel.send("Bunny API Error: " + err)
    }

}

module.exports.config = {
    command: "bunny",
    alias: "rabbit"
}