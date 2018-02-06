var exec = require('child_process').exec, child;
const os = require("os");
const Discord = require('discord.js');
const Manager = new Discord.ShardingManager('./bin/index.js');
const bot = new Discord.Client();
const botconfig = require("./bin/config.json")

if (botconfig.autoupdate == "true") {
    if (os.platform == "linux") {
        async () => {
            console.log("Linux updater started...")
            exec('rm -rf /home/pi/Desktop/beepBot/bin')
            exec('svn checkout https://github.com/HerrEurobeat/beepBot/trunk/bin /home/pi/Desktop/beepBot/bin')
            await Manager.spawn(botconfig.shards);
            await console.log("Updater finished.")
        } 
    } else {
        console.log("Not linux.")
        Manager.spawn(botconfig.shards);
    }
} else {
    console.log("Updater skipped.")
    Manager.spawn(botconfig.shards);
}


