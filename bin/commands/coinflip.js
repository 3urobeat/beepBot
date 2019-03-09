module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    message.channel.send(`The coin flipped to the **${v.randomstring(["Head","Tale"])}**!`)
}

module.exports.config = {
    command: "flip",
    alias: "coin",
    alias2: "coinflip"
}