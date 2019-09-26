module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    try {
        const { body } = await v.superagent
        .get('https://random.dog/woof.json')
        var imageurl = body.url
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
        console.log("Dog API Error: " + err)
        message.channel.send("Dog API Error: " + err)
    }

    }

module.exports.config = {
    command: "dog",
    alias: "woof",
    alias2: "bark"
}