module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    if (message.channel.type === "dm") {
        message.channel.send(v.dmerror())
        return;    
    }

    let text = args.slice(0).join(" ");
    if (text === "") {
        message.channel.send("Please define what i should say!")
        return;
    }
    message.delete();
    message.channel.send(text);

}

module.exports.config = {
    command: "say"
}