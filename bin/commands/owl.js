module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    try {
        const { body } = await v.superagent
        .get('http://pics.floofybot.moe/owl')
        var imageurl = body.image
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
        console.log("Owl API Error: " + err)
        message.channel.send("Owl API Error: " + err)
    }

}

module.exports.config = {
    command: "owl"
}