module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    try {
        const { body } = await v.superagent
        .get('http://aws.random.cat/meow')
        var imageurl = body.file
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
        console.log("Cat API Error: " + err)
        message.channel.send("Cat API Error: " + err)
    }

}

module.exports.config = {
    command: "cat",
    alias: "meow"
}