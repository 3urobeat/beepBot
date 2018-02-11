module.exports.run = async (bot, message, args, Discord) => {
    const v = require("../vars.js")
    
    const collector = new v.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 10000});
    var rpsrandom = arr => arr[Math.floor(Math.random() * 3)];

    async function rpsgame() {
        collector.on('collect', message => {
            if (message.content.toLowerCase() == "rock") {
                message.channel.send(rpsrandom(['rock','paper','scissors']));
                //rpsgameagain();
            } else if (message.content.toLowerCase() == "paper") {
                message.channel.send(rpsrandom(['rock','paper','scissors']));
                //rpsgameagain();
            } else if (message.content.toLowerCase() == "scissors") {
                message.channel.send(rpsrandom(['rock','paper','scissors']));
                //rpsgameagain();
            }              
            return;
        });            
    }
/*         function rpsgameagain() {
        message.channel.send("Play again `y/n`?")
        collector.on('collect', message => {
            if (message.content.toLowerCase() == "y") {
                message.channel.send("Okay! Replie with `rock|paper|scissors`.")
                return;
            } else if (message.content.toLowerCase() == "n") {
                message.channel.send("Okay, we can play again anytime you want!")
                return;
            }
        });  
    } */
    message.channel.send("Okay, lets play a game! Replie with `rock|paper|scissors`.")
    rpsgame();

}

module.exports.config = {
    command: "rps-game"
}