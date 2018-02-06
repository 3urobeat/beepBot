module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const index = require("../index.js")

    async () => {
        try {
            var options = {
                maxAge: false
            }
            
            if (message.channel.type == "dm") {
                message.channel.send("Invite me! ``" + index.botinvite + "``\nNeed support or something else? Join my Server: https://discord.gg/q3KXW2P")
                return;
            } else {
                message.channel.createInvite(options).then(async function(newInvite){
                    await message.channel.send("Join this channel: https://discord.gg/" + newInvite.code + "\nInvite me! ``" + index.botinvite + "``\nNeed support or something else? Join my Server: https://discord.gg/q3KXW2P")
                })
            }
        } catch (e) {
            message.channel.send("Error.")
        }
    }
}

module.exports.config = {
    command: "invite"
}