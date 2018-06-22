module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return;
    }
    if (args[0] === undefined) { message.channel.send("Please enter a valid amount. `1-100`").catch(err => {
        console.log("clear send no args error message error: " + err)}); return; }

    var messagecount = parseInt(args[0]);
    if (isNaN(messagecount) === true) { message.channel.send("It's something but not a clear number. `1-100`").catch(err => {
        console.log("clear send isNaN error message error: " + err)}); return; }
    if (messagecount > 100) { message.channel.send("Please enter a valid amount. `1-100`").catch(err => {
        console.log("clear send args>100 error message error: " + err)}); return; }
    if (messagecount < 1) { message.channel.send("Please enter a valid amount. `1-100`").catch(err => {
        console.log("clear send args<1 error message error: " + err)}); return; }
    
    if (message.member.permissions.has("MANAGE_MESSAGES", "ADMINISTRATOR")) {
        message.channel.fetchMessages({limit: messagecount + 1}).then(messages => message.channel.bulkDelete(messages)).catch(err => {
            message.channel.send("Error: " + err).catch(err => {
                console.log("clear send delete error message error: " + err)
            })
        })
    } else {
        message.channel.send(v.usermissperm()).catch(err => {
            console.log("clear send usermissperm error message error: " + err)
        })
    }

}

module.exports.config = {
    command: "clear",
    alias: "delete"
}