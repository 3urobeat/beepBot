module.exports.run = async (bot, message, args, lang) => {
    const v      = require("../../vars.js")
    const botjs  = require("../../bot.js")
    const logger = v.logger
    
}

module.exports.info = { //Note to self: If you add more restrictions you need to add them to the restrictions field in the help cmd!
    names: [], //Array<String> with all aliases
    description: "",
    usage: "",
    accessableby: [''], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false
}