module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    if (v.os.platform == "win32") {
        message.channel.send("Windows.")
    } else {
        if (v.os.platform == "linux") {
            message.channel.send("Linux.")
        } else {
            message.channel.send("undefined.")
        }
    } 
}

module.exports.config = {
    command: "os"
}