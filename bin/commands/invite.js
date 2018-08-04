module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const index = require("../index.js")

    var options = {
        maxAge: false
    }
    
    if (message.channel.type == "dm") {
        message.channel.send("Invite me! ``" + index.botinvite + "``\nNeed support or something else? Join my Server: https://discord.gg/" + v.ssinvitecode)
        return;
    } else {
        if (message.member.permissions.has("CREATE_INSTANT_INVITE", "ADMINISTRATOR")) {
            message.channel.createInvite(options).then(function(newInvite){
                message.channel.send("Join this channel: https://discord.gg/" + newInvite.code + "\nInvite me! ``" + index.botinvite + "``\nNeed support or something else? Join my Server: https://discord.gg/" + v.ssinvitecode)
            }).catch(err => {
                message.channel.send("Join this channel: " + err + "\nInvite me! ``" + index.botinvite + "``\nNeed support or something else? Join my Server: https://discord.gg/" + v.ssinvitecode)
            })
        } else {
            message.channel.send(v.usermissperm() +  "\nInvite me! ``" + index.botinvite + "``\nNeed support or something else? Join my Server: https://discord.gg/" + v.ssinvitecode)
        }
    }

}

module.exports.config = {
    command: "invite"
}