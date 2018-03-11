module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    message.channel.send("The cat command got disabled because of a missing api. :(")
    return;

    try {
        const { body } = await v.superagent
        .get('http://thecatapi.com/api/images/get')
        message.channel.send(": " + body.file)
    } catch (err) {
        console.log("Cat API Error: " + err)
        message.channel.send("Cat API Error: " + err)
    }

}

module.exports.config = {
    command: "cat",
    alias: "meow"
}