module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (!message.channel.nsfw) return message.channel.send("🔞 You have to use this in a nsfw channel!");

    try {
        const { body } = await v.superagent
        .get('https://nekobot.xyz/api/image?type=4k')
        var imageurl = body.message
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
        console.log("4k API Error: " + err)
        message.channel.send("nekobot.xyz 4k API Error: " + err)
    }

}

module.exports.config = {
    command: "4k"
}