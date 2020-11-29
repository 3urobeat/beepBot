module.exports.run = async (bot, message, args, lang, v, logger) => {
    let invalidamount = lang.cmd.othermoderation.clearinvalidamount
    if (!args[0]) { message.channel.send(invalidamount); return; }

    var messagecount = parseInt(args[0]);
    if (isNaN(messagecount)) { message.channel.send(invalidamount); return; }
    if (messagecount > 100 || messagecount < 1) { message.channel.send(invalidamount); return; }

    message.channel.messages.fetch({limit: messagecount + 1}).then(messages => 
        message.channel.bulkDelete(messages)).catch(err => {
            message.channel.send("clear delete msg error: " + err)
            logger("clear delete msg error: " + err) })
}

module.exports.info = {
    names: ["clear", "delete"],
    description: "Deletes an amount of recent messages.",
    usage: "(amount of messages)",
    accessableby: ['moderators'],
    allowedindm: false,
    nsfwonly: false
}