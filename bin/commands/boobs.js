module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (!message.channel.nsfw) return message.channel.send("🔞 You have to use this in a nsfw channel!");

    try {
        const { body } = await v.superagent
        .get('http://api.oboobs.ru/boobs/0/1/random')
        var imageurl = "http://media.oboobs.ru/" + body[0].preview
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
        console.log("boobs API Error: " + err)
        message.channel.send("boobs API Error: " + err)
    }

}

module.exports.config = {
    command: "boobs"
}