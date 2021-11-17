module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    var messagecount = parseInt(args[0]);
    var randomnumber = Math.floor((Math.random() * messagecount) + 1);

    let nomaxprovided = lang.cmd.othermisc.dicenomaxprovided

    if (!args[0]) return message.channel.send(nomaxprovided);
    if (isNaN(messagecount)) return message.channel.send(nomaxprovided);
    if (messagecount < 2) return message.channel.send(nomaxprovided);

    message.channel.send(':game_die: ' + fn.randomstring(lang.cmd.othermisc.dicerandommsg) + " **" + randomnumber + "**")
    return;
}

module.exports.info = {
    names: ["dice", "roll"],
    description: "cmd.othermisc.diceinfodescription",
    usage: "(limit)",
    accessableby: ['all'], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false
}