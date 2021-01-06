/* eslint-disable */ //remove this
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    const botjs  = require("../../bot.js") //remove if not needed
    let lf       = lang //Should this file use his lang file path often use this var as shorthand
    
}

module.exports.info = { //Note to self: If you add more restrictions you need to add them to the restrictions field in the help cmd!
    names: [], //Array<String> with all aliases
    description: "",
    usage: "",
    accessableby: [''], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false
}