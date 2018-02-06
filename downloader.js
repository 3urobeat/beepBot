var exec = require('child_process').exec, child;
const os = require("os");
const Discord = require('discord.js');
const bot = new Discord.Client();
const botconfig = require("./bin/config.json")

if (os.platform == "linux") {
    async () => {
        exec('rm -rf /home/pi/Desktop/beepBot/bin')
        exec('svn checkout https://github.com/HerrEurobeat/beepBot/trunk/bin /home/pi/Desktop/beepBot/bin')
        console.log("Linux updater started...")
    } 
} else {
    Manager.spawn(botconfig.shards);
}