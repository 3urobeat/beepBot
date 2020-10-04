module.exports.run = async (bot, message, args, lang) => {
    const v = require("../../vars.js")
    
    var messagecount = parseInt(args[0]);
    var randomnumber = Math.floor((Math.random() * messagecount) + 1);

    if (!args[0]) { message.channel.send(lang.dicenomaxprovided); return; }
    if (isNaN(messagecount)) { message.channel.send(lang.dicenomaxprovided); return; }
    if (messagecount < 2) { message.channel.send(lang.dicenomaxprovided); return; }

    message.channel.send(':game_die: ' + v.randomstring(lang.dicerandommsg) + " **" + randomnumber + "**")
    return;
}

module.exports.info = {
    names: ["dice", "roll"],
    description: "Roll a dice with a custom limit.",
    accessableby: ['all'], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false
}