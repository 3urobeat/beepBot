module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    var messagecount = parseInt(args[0]);
    var randomnumber = Math.floor((Math.random() * messagecount) + 1);

    if (args[0] === undefined) { message.channel.send("You have to give the endless dice a valid maximum! `2-∞`"); return; }
    if (isNaN(messagecount) === true) { message.channel.send("It's something but not a clear number. `2-∞`"); return; }
    if (messagecount < 2) { message.channel.send("You have to give the endless dice a valid minimum! `2-∞`"); return; }

    message.channel.send(v.randomstring(['Rolling... Stop! Its a','The dice stopped rolling:','Your Number:','...and its a','Dont become addicted!','Its like lottery! Did you won?']) + " **" + randomnumber + "**")
    return;
}

module.exports.config = {
    command: "dice"
}