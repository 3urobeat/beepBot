module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.author.id === v.OWNERID) {
        var setname = args.slice(0).join(" ")
        if (setname.length > 32) { message.channel.send("Please provide a valid name. `2-32`"); return; }
        if (setname.length < 2) { message.channel.send("Please provide a valid name. `2-32`"); return; }

        if (setname === "default") {
            v.bot.user.setUsername(v.BOTNAME).catch(err => {
                message.channel.send("An error occured: " + err)
                console.log(v.LOGWARN + err)
                return;
            })
            console.log("Changed name to default.")
            message.channel.send("Changed name to default.")
            return;
        }

        if (setname === "x-mas") {
            v.bot.user.setUsername(v.BOTXMASNAME).catch(err => {
                message.channel.send("An error occured: " + err)
                console.log(v.LOGWARN + err)
                return;
            })
            console.log("Changed name to x-mas.")
            message.channel.send("Changed name to x-mas.")
            return;
        }
        
        v.bot.user.setUsername(setname).catch(err => {
            message.channel.send("Error: " + err)
            console.log(v.LOGWARN + err)
            return;
        })
        console.log("Changed name.")
        message.channel.send("Changed name.")

    } else {
        message.channel.send(v.owneronlyerror())
        return;
    }

}

module.exports.config = {
    command: "setname"
}