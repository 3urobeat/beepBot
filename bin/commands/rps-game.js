module.exports.run = async (bot, message, args, Discord) => {
    const v = require("../vars.js")
    
    if (args[0] === undefined) {
        message.channel.send("Please provide 'rock|paper|scissors'!")
        return;
    }
    var word = args[0].toLowerCase()
    var decision = function decision() { return v.randomstring(["rock","paper","scissors"]) }
    const rpsdecision = decision()

    console.log(rpsdecision)
    if (word === "rock") {
        if (rpsdecision === "rock") {
            message.channel.send(":rocket: vs :rocket: \nDraw!")
        } else if (rpsdecision === "paper") {
            message.channel.send(":rocket: vs :newspaper: \n" + v.bot.user + " won!")
        } else if (rpsdecision === "scissors") {
            message.channel.send(":rocket: vs :scissors: \n" + message.member + " won!")
        }
        return;
    } else if (word === "paper") {
        if (rpsdecision === "rock") {
            message.channel.send(":newspaper: vs :rocket: \n" + message.member + " won!")
        } else if (rpsdecision === "paper") {
            message.channel.send(":newspaper: vs :newspaper: \nDraw!")
        } else if (rpsdecision === "scissors") {
            message.channel.send(":newspaper: vs :scissors: \n" + v.bot.user + " won!")
        }
        return;
    } else if (word === "scissors") {
        if (rpsdecision === "rock") {
            message.channel.send(":scissors: vs :rocket: \n" + v.bot.user + " won!")
        } else if (rpsdecision === "paper") {
            message.channel.send(":scissors: vs :newspaper: \n" + message.member + " won!")
        } else if (rpsdecision === "scissors") {
            message.channel.send(":scissors: vs :scissors: \nDraw!")
        }
        return;
    } else {
        message.channel.send("Please provide 'rock|paper|scissors'!")
        return;
    }

}

module.exports.config = {
    command: "rps",
    alias: "rps-game"
}