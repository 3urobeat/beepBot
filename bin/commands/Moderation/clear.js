module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    let invalidamount = lang.cmd.othermoderation.clearinvalidamount
    if (!args[0]) return message.channel.send(invalidamount);

    var messagecount = parseInt(args[0]);
    if (isNaN(messagecount)) return message.channel.send(invalidamount);
    if (messagecount > 100 || messagecount < 1) return message.channel.send(invalidamount);

    if (message.member.permissions.has("MANAGE_MESSAGES", "ADMINISTRATOR")) {
        message.channel.messages.fetch({limit: messagecount + 1}).then(messages => 
            message.channel.bulkDelete(messages)).catch(err => {
                message.channel.send(`${lang.general.anerroroccurred} ${err}`)
                message.react("❌").catch(() => {}) //catch but ignore error
                return; })
        
                fn.msgtomodlogchannel(message.guild, "clear", message.author, {}, [messagecount, message.channel])
    } else {
        message.channel.send(fn.usermissperm(lang))
        message.react("❌").catch(() => {}) } //catch but ignore error
}

module.exports.info = {
    names: ["clear", "delete"],
    description: "cmd.othermoderation.clearinfodescription",
    usage: "(amount of messages)",
    accessableby: ['moderators'],
    allowedindm: false,
    nsfwonly: false
}