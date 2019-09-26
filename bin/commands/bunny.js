module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    try {
        const { body } = await v.superagent
        .get('https://api.bunnies.io/v2/loop/random/?media=gif')
        var imageurl = body.media.gif
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
        console.log("Bunny API Error: " + err)
        message.channel.send("Bunny API Error: " + err)
    }

}

module.exports.config = {
    command: "bunny",
    alias: "rabbit"
}