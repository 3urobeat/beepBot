module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const i = require("../index.js")

    message.channel.send(i.tempc)

}

module.exports.config = {
    command: "test"
}