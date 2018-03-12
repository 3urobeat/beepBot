module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    message.channel.send("Here is the link to my GitHub: \n" + v.githublink)

    }

module.exports.config = {
    command: "github"
}