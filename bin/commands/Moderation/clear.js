module.exports.run = async (bot, message, args, lang) => {
    const v      = require("../../vars.js")
    const logger = v.logger
    
    if (!args[0]) { message.channel.send(lang.clearinvalidamount); return; }

    var messagecount = parseInt(args[0]);
    if (isNaN(messagecount)) { message.channel.send(lang.clearinvalidamount); return; }
    if (messagecount > 100 || messagecount < 1) { message.channel.send(lang.clearinvalidamount); return; }

    message.channel.messages.fetch({limit: messagecount + 1}).then(messages => 
        message.channel.bulkDelete(messages)).catch(err => {
            message.channel.send("clear delete msg error: " + err)
            logger("clear delete msg error: " + err) })
}

module.exports.info = {
    names: ["clear", "delete"],
    description: "Deletes an amount of recent messages.",
    accessableby: ['moderators'],
    allowedindm: false,
    nsfwonly: false
}