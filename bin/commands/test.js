module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    message.channel.send("1" + Array(101).join(" ") + "1")

    }

module.exports.config = {
    command: "test"
}