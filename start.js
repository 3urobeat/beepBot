var exec = require('child_process').exec, child;
const os = require("os");
const Discord = require('discord.js');
const Manager = new Discord.ShardingManager('./bin/index.js');
const bot = new Discord.Client();
const botconfig = require("./bin/config.json")

if (botconfig.autoupdate == "true") {
    if (os.platform == "linux") {
        console.log("Linux updater started...")
        exec('rm -rf /home/pi/Desktop/beepBot/bin')
        exec('svn checkout https://github.com/HerrEurobeat/beepBot/trunk/bin /home/pi/Desktop/beepBot/bin')
        bot.setTimeout(() => {
            Manager.spawn(botconfig.shards);
            console.log("Updater finished.")
        }, 5000)
    } else {
        console.log("Not linux.")
        Manager.spawn(botconfig.shards);
    }
} else {
    console.log("Updater skipped.")
    Manager.spawn(botconfig.shards);
}


