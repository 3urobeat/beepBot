module.exports.run = async (bot, message, args, lang) => {
    const v = require("../../vars.js")
    const shard = require("../../shard.js")
    var logger = v.logger
    
}

module.exports.aliases = {
    1: ""
}
module.exports.info = {
    name: "",
    description: "",
    accessableby: [''], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false,
    aliases: this.aliases
}