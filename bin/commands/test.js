module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const fs = v.fs

    v.bot.channels.get("231827708198256642").send("Test.")

}

module.exports.config = {
    command: "test"
}