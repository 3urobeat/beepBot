module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    message.channel.send("Random WikiHow Article: \nhttps://en.wikihow.com/Special:Randomizer")

}

module.exports.config = {
    command: "wikihow"
}