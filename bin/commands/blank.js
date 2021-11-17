/* eslint-disable */ //remove this
const Discord = require('discord.js'); //eslint-disable-line

/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    let lf = lang //Should this file use his lang file path often use this var as shorthand
    
}

module.exports.info = { //Note to self: If you add more restrictions you need to add them to the restrictions field in the help cmd!
    names: [], //Array<String> with all aliases
    description: "", //Path to lang file entry (example: "cmd.othergeneral.pinginfodescription")
    usage: '',
    accessableby: [''], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false,
    allowedguilds: config.musicenabledguilds //Optional value. Provide array with guildids as Strings that should only be allowed to use this command
}