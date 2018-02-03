module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.author.id === v.OWNERID) {
        let newstatus = args[0];
        if (newstatus == "online") {
            bot.user.setStatus(newstatus).catch(err => {
                message.channel.send("Error: " + err)
                return;
            })
            await console.log("New status set: " + newstatus)
            await message.channel.send("New status: " + newstatus)
            return; }
        if (message.content.includes("idle")) {
            bot.user.setStatus(newstatus).catch(err => {
                message.channel.send("Error: " + err)
                return;
            })
            await console.log("New status set: " + newstatus)
            await message.channel.send("New status: " + newstatus)
            return; }
        if (message.content.includes("dnd")) {
            bot.user.setStatus(newstatus).catch(err => {
                message.channel.send("Error: " + err)
                return;
            })
            await console.log("New status set: " + newstatus)
            await message.channel.send("New status: " + newstatus)
            return; }
        if (newstatus == undefined) {
            message.channel.send("Please enter a valid status `online|idle|dnd`.")
            return;
        }
        message.channel.send("Please enter a valid status `online|idle|dnd`.")
    } else {
        message.channel.send(v.owneronlyerror())
        return;
    }

}

module.exports.config = {
    command: "setstatus"
}