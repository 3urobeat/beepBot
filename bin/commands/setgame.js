module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (message.author.id === v.OWNERID) {

        var newgame = args.slice(0).join(" ");
        
        if (args[0] === "default") {
            var newgame = v.DEFAULTGAME
        }

        bot.user.setGame(newgame).catch(err => {
            message.channel.send("Failed to set game.")
            console.log(err)
        })
        message.channel.send("New playing status set: " + newgame)
        console.log("New playing status set: " + newgame)

/*             const fs = require('fs');
        botconfig.game = newgame;
        fs.appendFile(botconfigpath, JSON.stringify(botconfig.game, null, 4), err => {
            if(err) throw err;
            console.log("Error writing.")
        });
        console.log("New game written to JSON file.") */
    } else {
        message.channel.send(v.owneronlyerror())
        return;
    }

}

module.exports.config = {
    command: "setgame"
}