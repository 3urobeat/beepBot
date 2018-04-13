module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    if (v.botconfig.musicenable === "false") {
        message.channel.send("The music command is disabled. :expressionless: ")
        return;
    }
    
    if (message.channel.type == "dm") {
        message.channel.send(v.randomstring(v.dmerror))
        return;
    }
    
    var server = v.servers[message.guild.id];
    if (server.dispatcher) server.dispatcher.end();

}

module.exports.config = {
    command: "skip"
}