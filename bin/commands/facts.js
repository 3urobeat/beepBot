module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const i = require("../index.js")

    if (args[0] === undefined) {
        message.channel.send("Please provide 'dog|cat|panda'!")
        return;
    }

    var animal = args.slice(0).join(" ")

    if (animal === "dog") {
        const { body } = await v.superagent
        .get('https://some-random-api.ml/dogfact')
        message.channel.send(body.fact)
        return;
    } else if (animal === "cat") {
        const { body } = await v.superagent
        .get('https://some-random-api.ml/catfact')
        message.channel.send(body.fact)
        return;
    } else if (animal === "panda") {
        const { body } = await v.superagent
        .get('https://some-random-api.ml/pandafact')
        message.channel.send(body.fact)
        return;
    } else {
        message.channel.send("Please provide 'dog|cat|panda'!")
        return;
    }


}

module.exports.config = {
    command: "fact",
    alias: "facts"
}