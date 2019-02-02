module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const i = require("../index.js")
    const math = require('mathjs')

    if (!args[0]) return message.channel.send("Please input something to calculate!");

    let resp;
    try {
        resp = math.eval(args.join(" "));
    } catch (e) {
        return message.channel.send("Please input a valid calculation!")
    }

    message.channel.send({embed:{
        title: "Math Calculation",
        color: 0xffffff,
        fields: [
            {
                name: "Input:",
                value: `\`\`\`js\n${args.join(' ')}\`\`\``,
            },
            {
                name: "Output:",
                value: `\`\`\`js\n${resp}\`\`\``,
            }
        ]
    }})
}

module.exports.config = {
    command: "calc",
    alias: "calculate",
    alias2: "calculator"
}