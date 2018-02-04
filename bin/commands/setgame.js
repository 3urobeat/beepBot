module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const index = require("../../index.js")
    const fs = v.fs;
    
    if (message.author.id === v.OWNERID) {

        var newgametext = args.slice(0).join(" ");
        var newgame = newgametext;
        
        if (args[0] === "default") {
            var newgametext = index.GAME
            var newgame = v.DEFAULTGAME
            
        }

        bot.user.setGame(newgametext).catch(err => {
            message.channel.send("Failed to set game.")
            console.log(err)
        })
        message.channel.send("New playing status set: " + newgametext)
        console.log("New playing status set: " + newgametext)
        
        v.botconfig = {
            token: v.botconfig.token,
            testtoken: v.botconfig.testtoken,
            loginmode: v.botconfig.loginmode,
            prefix: v.botconfig.prefix,
            game: newgame,
            version: v.botconfig.version,
            musicenable: v.botconfig.musicenable,
            debug: v.botconfig.debug
        }

        fs.writeFile("./bin/config.json", JSON.stringify(v.botconfig, null, 4), err => {
            if(err) message.channel.send("Error: " + err); return;
        });
        console.log("New game written to config file.")
    } else {
        message.channel.send(v.owneronlyerror())
        return;
    }

}

module.exports.config = {
    command: "setgame"
}