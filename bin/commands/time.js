module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    message.channel.send("Bot time: " + v.d);
}

module.exports.config = {
    command: "time",
    alias: "date",
    alias2: "bottime"
}