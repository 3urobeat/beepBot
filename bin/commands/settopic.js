module.exports.run = async (bot, message, args, Discord) => {
    const v = require("../vars.js")

    if (message.member.permissions.has("MANAGE_CHANNELS", "ADMINISTRATOR")) {
        if (args[0] === undefined) {
            var newtopic = " "
        } else {
            var newtopic = args.slice(0).join(" ")
        }
        message.channel.setTopic(newtopic) 
    } else {
        message.channel.send(v.usermissperm())
        return;
    }


}

module.exports.config = {
    command: "settopic"
}