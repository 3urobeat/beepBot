module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    var messagecount = parseInt(args[0]);
    var randomnumber = Math.floor((Math.random() * messagecount) + 1);

    let nomaxprovided = lang.cmd.othermisc.dicenomaxprovided
    if (!args[0]) { message.channel.send(nomaxprovided); return; }
    if (isNaN(messagecount)) { message.channel.send(nomaxprovided); return; }
    if (messagecount < 2) { message.channel.send(nomaxprovided); return; }

    message.channel.send(':game_die: ' + fn.randomstring(lang.cmd.othermisc.dicerandommsg) + " **" + randomnumber + "**")
    return;
}

module.exports.info = {
    names: ["dice", "roll"],
    description: "Roll a dice with a custom limit.",
    usage: "(limit)",
    accessableby: ['all'], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false
}