module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    try {
        const { body } = await v.superagent
        .get('https://some-random-api.ml/pandaimg')
        var imageurl = body.link
        message.channel.send({embed:{
            title: "Image doesn't load? Click here!",
            url: imageurl,
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
        console.log("Panda API Error: " + err)
        message.channel.send("Panda API Error: " + err)
    }

    }

module.exports.config = {
    command: "panda"
}