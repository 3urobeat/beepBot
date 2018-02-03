module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    const { body } = await v.superagent
    .get('https://random.cat/meow');
    message.channel.send(body.file)

}

module.exports.config = {
    command: "cat",
    alias: "meow"
}