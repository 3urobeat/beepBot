module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (!message.channel.nsfw) return message.channel.send("🔞 You have to use this in a nsfw channel!");

    try {
        const { body } = await v.superagent
        .get('http://api.obutts.ru/butts/0/1/random')
        var imageurl = "http://media.obutts.ru/" + body[0].preview
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
        console.log("butts API Error: " + err)
        message.channel.send("butts API Error: " + err)
    }

}

module.exports.config = {
    command: "butts"
}