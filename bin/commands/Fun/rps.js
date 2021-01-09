module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    function sendresponse(wordarr, decision, result) {
        if (wordarr[0] == decision[0]) return message.channel.send(`${wordarr[1]} vs ${decision[1]}\n${lang.cmd.otherfun.rpstie}`)

        if (result == "win") return message.channel.send(`${wordarr[1]} vs ${decision[1]}\n${lang.cmd.otherfun.rpswin}`)
            else return message.channel.send(`${wordarr[1]} vs ${decision[1]}\n${lang.cmd.otherfun.rpsloose}`) }
        
    var word = args[0]
    let decision = fn.randomstring([[0, ":rocket:"], [1, ":newspaper:"], [2, ":scissors:"]]) //get decision by index ["rock", "paper", "scissors"]
   
    switch (word) { //user decision
        case "r":
        case "rock":
            if (decision == 2) sendresponse([0, ":rocket:"], decision, "win") //user wins
                else sendresponse([0, ":rocket:"], decision, "loose") //user looses (or tie but that gets handled by function)
            break;
        case "p":
        case "paper":
            if (decision == 1) sendresponse([1, ":newspaper:"], decision, "win")
                else sendresponse([1, ":newspaper:"], decision, "loose")
            break;
        case "s":
        case "scissors":
            if (decision == 0) sendresponse([2, ":scissors:"], decision, "win")
                else sendresponse([2, ":scissors:"], decision, "loose")
            break;
        default:
            return message.channel.send(lang.cmd.otherfun.rpsusage)
    }
}

module.exports.info = {
    names: ["rps"],
    description: "Play rock paper scissors against the bot!",
    usage: "('r'/'rock'/'p'/'paper'/'s'/'scissors')",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}