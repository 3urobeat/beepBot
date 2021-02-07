//This file contains code of the servertosettings function and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

module.exports.run = (bot, logger, guild, removeentry) => {
    //if removeentry is true just remove entry and stop further execution
    if (removeentry) {
        logger("info", "servertosettings.js", `removeentry: Removing ${guild.id} from settings database...`, false, true)
        bot.settings.remove({ guildid: guild.id }, (err) => { if (err) logger("error", "servertosettings.js", `Error removing guild ${guild.id}: ${err}`) })
        return; }

    if (!guild.id) return logger("error", "servertosettings.js", "Can't write guild to settings because guild id is undefined!"); //missing guildid will make entry unuseable

    bot.settings.findOne({ guildid: guild.id }, (err, data) => {
        //adding prefix to server nickname
        if (guild.members.cache.get(bot.user.id).nickname === null) { //bot has no nickname, start nickname with username
            var nickname = bot.user.username
        } else {
            if (!data || !data.prefix) var nickname = guild.members.cache.get(String(bot.user.id).nickname) //get nickname without trying to replace old prefix if server has no entry in settings.json yet
                else var nickname = guild.members.cache.get(String(bot.user.id)).nickname.replace(` [${data.prefix}]`, "") }

        if (bot.config.loginmode == "normal") var prefix = bot.constants.DEFAULTPREFIX
            else var prefix = bot.constants.DEFAULTTESTPREFIX
        
        if (nickname == undefined) var nickname = bot.user.username //since nickname can still somehow be undefined check one last time
        guild.members.cache.get(String(bot.user.id)).setNickname(`${nickname} [${prefix}]`).catch(() => {}) //catch error but ignore it

        let defaultguildsettings = bot.constants.defaultguildsettings
        defaultguildsettings["guildid"] = guild.id
        defaultguildsettings["prefix"] = prefix

        logger("info", "servertosettings.js", `Adding ${guild.id} to settings database with default settings...`, false, true)
        if (data) bot.settings.remove({ guildid: guild.id }, (err) => { if (err) logger("error", "servertosettings.js", `Error removing guild ${guild.id}: ${err}`) })
        bot.settings.insert(defaultguildsettings, (err) => { if (err) logger("error", "servertosettings.js", "Error inserting guild: " + err) })
    })
}