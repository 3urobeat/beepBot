module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const collector = new v.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 10000});

    if (message.author.id === v.OWNERID) {

        v.botconfig = {
            shards: 1,
            loginmode: "normal",
            prefix: "*",
            game: "*help | HerrEurobeat",
            gametype: "PLAYING",
            status: "dnd",
            version: v.botconfig.version,
            musicenable: "false",
            debug: "false"
        }

        await v.fs.writeFile("./bin/config.json", JSON.stringify(v.botconfig, null, 4), err => {
            if(err) message.channel.send("Error: " + err); return;
        });
        await console.log("Config was resetted.")
        await message.channel.send("Config was resetted. You need to restart to see changes.")

    } else {
        message.channel.send(v.owneronlyerror())
        return;
    }

}

module.exports.config = {
    command: "configreset",
    alias: "confres"
}