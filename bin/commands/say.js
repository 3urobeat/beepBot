module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    if (message.author.id === v.OWNERID) {
        
        if (message.channel.type === "dm") {
            message.channel.send(v.dmerror())
            return;    
        }

        let text = args.slice(0).join(" ");
        if (text === "") {
            message.channel.send("Please define what i should say!")
            return;
        }
        message.delete().catch(err => {
            message.channel.send("Delete command message error: " + err)
        });
        message.channel.send(text)

    } else {
        message.channel.send(v.owneronlyerror())
        return;
    }

}

module.exports.config = {
    command: "say"
}