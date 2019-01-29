module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    try {
        const { body } = await v.superagent
        .get('http://shibe.online/api/shibes')
        message.channel.send(body[0])
    } catch (err) {
        console.log("shibe.online API Error: " + err)
        message.channel.send("shibe.online API Error: " + err)
    }

    }

module.exports.config = {
    command: "shibainu",
    alias: "shiba",
    alias2: "doge"
}