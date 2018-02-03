module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    message.channel.send("Random WikiHow Article: \nhttps://de.wikihow.com/Special:Randomizer")

}

module.exports.config = {
    command: "wikihow"
}