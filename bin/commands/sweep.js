module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    let randomuser = message.guild.members.filter(isbot => !isbot.user.bot).random();

    await message.channel.send({embed: {
        title: 'Sweeped user:',
        color: v.randomhex(),
        thumbnail: {
            url: randomuser.user.displayAvatarURL,
        },
        fields: [
        {
            name: 'User',
            value: randomuser.user.tag,
            inline: true
        },
        {
            name: 'ID',
            value: randomuser.user.id,
            inline: true
        }
        ],
        footer: {
            text: "Requested by " + message.author.username,
            icon_url: message.author.displayAvatarURL
        },
        timestamp: message.createdAt,
    }
    })
}

module.exports.config = {
    command: "sweep",
    alias: "randomuser"
}