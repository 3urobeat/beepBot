module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    try {
        const { body } = await v.superagent
/*         .get('https://dog.ceo/api/breeds/image/random') */ //Old api
        .get('https://random.dog/woof.json')
        message.channel.send(body.url)
    } catch (err) {
        console.log("Dog API Error: " + err)
        message.channel.send("Dog API Error: " + err)
    }

    }

module.exports.config = {
    command: "dog",
    alias: "woof",
    alias2: "bark"
}