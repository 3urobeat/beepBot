module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.author.id === v.OWNERID) {
        if (args[0] === undefined) { message.channel.send("Please provide a valid argument."); return; }
        if (args[0] === "default") {
            v.bot.user.setAvatar(v.botdefaultavatar).catch(err => {
                message.channel.send("An error occured: " + err)
                return;
            })
            console.log("Changed avatar to default.")
            message.channel.send("Changed avatar to default.")
            return;
        }
        if (args[0] === "x-mas") {
            v.bot.user.setAvatar(v.botxmasavatar).catch(err => {
                message.channel.send("An error occured: " + err)
                return;
            })
            console.log("Changed avatar to x-mas.")
            message.channel.send("Changed avatar to x-mas.")
            return;
        }
        if (args[0] === "testbot") {
            v.bot.user.setAvatar(v.botdefaultavatar).catch(err => {
                message.channel.send("An error occured: " + err)
                return;
            })
            console.log("Changed avatar to the testbot default.")
            message.channel.send("Changed avatar to the testbot default.")
            return;
        }
        v.bot.user.setAvatar(args[0]).catch(err => {
            message.channel.send("Error: " + err)
            return;
        })
        console.log("Changed avatar.")
        message.channel.send("Changed avatar.")

    } else {
        message.channel.send(v.owneronlyerror())
        return;
    }

}

module.exports.config = {
    command: "setavatar"
}