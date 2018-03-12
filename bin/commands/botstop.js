module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const collector = new v.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 10000});

    if (message.author.id === v.OWNERID) {
        if (v.os.platform === "win32") {
            message.channel.send("When i'm running on Windows i can't stop your programm because you had to use some sort of plugin and not the good old pm2. Your fault. :expressionless: ")
            return;
        }
        message.channel.send("Are you sure? `y/n`")
        collector.on('collect', message => {
            if (message.content == "y") {
                message.channel.send("Stopping bot...")
                console.log("Process exit via botstop command...")
                v.exec('pm2 stop bot')
                return;
            } else if (message.content == "n") {
                message.channel.send("Abort!")
                return;
            }
        });

    } else {
        message.channel.send(v.owneronlyerror())
        return;
    }

}

module.exports.config = {
    command: "botstop"
}