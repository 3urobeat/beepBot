module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    try {
        const { body } = await v.superagent
        .get('http://shibe.online/api/shibes')
        var imageurl = body[0]
        message.channel.send({embed:{
            title: imageurl,
            image: {
                url: imageurl
            },
            footer:{
                icon_url: message.author.displayAvatarURL,
                text: "Requestet by " + message.author.username
            },
            timestamp: message.createdAt,
            color: v.randomhex()
        }})
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