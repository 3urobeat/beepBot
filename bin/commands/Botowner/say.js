module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    if (!args[0]) return message.channel.send(lang.cmd.otherbotowner.saymissingargs)
    message.delete().catch(err => { return message.channel.send("Error deleting message: " + err) })
    message.channel.send(args.join(" "))
    
}

module.exports.info = {
    names: ["say"],
    description: "Deletes the cmd message and replies with the specified text.",
    usage: "(text)",
    accessableby: ['botowner'],
    allowedindm: true,
    nsfwonly: false
}