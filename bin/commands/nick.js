module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return;
    }
    let nickmention = message.mentions.users.first()
    if (message.mentions.users.size === 0) {
        if (message.member.permissions.has("CHANGE_NICKNAME", "ADMINISTRATOR")) {
            let nickchange = args.slice(0).join(" ");
            if (args[0] === undefined) {
                message.channel.send("Please provide a valid nickname!")
                return;
            }
            message.guild.members.get(message.author.id).setNickname(nickchange).catch(err => {
                message.channel.send("Error: " + err)
                return;
            });
            message.channel.send("Changed your nickname to: `" + nickchange + "`")
            return;
        } else {
            message.channel.send("You don't have permission to change your username. :confused:")
            return;
        }
        return; 
    }
    if (message.member.permissions.has("MANAGE_NICKNAMES", "ADMINISTRATOR")) {
        let nickchange = args.slice(1).join(" ");
        if (args[0] === undefined) {
            message.channel.send("Please provide a valid nickname!")
            return;
        }
        message.guild.members.get(nickmention.id).setNickname(nickchange).catch(err => {
            message.channel.send("Error: " + err);
            return;
        });
        message.channel.send("Nick of " + nickmention + " (" + nickmention.username + "#" + nickmention.discriminator + ") changed to: `" + nickchange + "`")
        return;
    } else {
        message.channel.send(v.usermissperm())
    }

}

module.exports.config = {
    command: "nick"
}