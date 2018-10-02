module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    var https = require("https")

    if (message.author.id === v.OWNERID) {
        if (v.os.platform == "linux") {
            console.log("Manual updater started. Updating downloader.js...")
            message.channel.send("Manual updater started. Updating downloader.js...")
            v.bot.user.setPresence({game: { name: "updating...", type: "WATCHING"}}).catch(err => {
                console.log("update setPresence error: " + err)
            }) 

            try {
                https.get("https://raw.githubusercontent.com/HerrEurobeat/beepBot/master/downloader.js", function(res){
                    res.setEncoding('utf8');
                    res.on('data', function(chunk){

                        v.fs.writeFile("downloader.js", chunk, err => {
                            if(err) message.channel.send("update write to downloader file Error: " + err); return;
                        });

                        v.bot.setTimeout(() => {
                            message.channel.send("Starting downloader.js...")
                            v.exec('node /home/pi/Desktop/beepBot/downloader.js')
                            message.channel.send("Linux updater started...")
                        }, 2500)
                        
                    });
                });
            } catch (err) {
                console.log("update updating downloader Error: " + err)
                message.channel.send("update updating downloader Error: " + err)
            }
        } else {
            message.channel.send("The bot is not running on Linux!")
            return;
        }
    } else {
        message.channel.send(v.owneronlyerror())
        return;
    }

}

module.exports.config = {
    command: "updater",
    alias: "update"
}