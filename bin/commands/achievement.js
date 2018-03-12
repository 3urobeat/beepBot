//Main Code from: https://github.com/eslachance/evie.selfbot/blob/master/commands/achievement.js
const snekfetch = require('snekfetch')

module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    if (args[0] === undefined) {
        message.channel.send("Please provide a argument that will be the achievement description!"); return;
    }

    let [title, contents] = args.join(" ").split("|");
    if(!contents) {
      [title, contents] = ["Achievement Get!", title];
    }
    let rnd = Math.floor((Math.random() * 39) + 1);
    if(args.join(" ").toLowerCase().includes("burn")) rnd = 38;
    if(args.join(" ").toLowerCase().includes("cookie")) rnd = 21;
    if(args.join(" ").toLowerCase().includes("cake")) rnd = 10;
    
    if(title.length > 22 || contents.length > 22) return message.channel.send("Max Length: 22 Characters. Soz.")
    const url = `https://www.minecraftskinstealer.com/achievement/a.php?i=${rnd}&h=${encodeURIComponent(title)}&t=${encodeURIComponent(contents)}`;
    snekfetch.get(url)
     .then(r=>message.channel.send("", {files:[{attachment: r.body}]})).catch(err => {
         return;
     })

    }

module.exports.config = {
    command: "achievement"
}