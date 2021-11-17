/*
 * File: servertosettings.js
 * Project: beepbot
 * Created Date: 07.02.2021 17:27:00
 * Author: 3urobeat
 * 
 * Last Modified: 17.11.2021 19:31:22
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


//This file contains code of the servertosettings function and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

module.exports.run = (bot, logger, guild, removeentry) => {
    //if removeentry is true just remove entry and stop further execution
    if (removeentry) {
        logger("info", "servertosettings.js", `removeentry: Removing ${guild.id} from settings database...`, false, true)
        bot.settings.remove({ guildid: guild.id }, (err) => { if (err) logger("error", "servertosettings.js", `Error removing guild ${guild.id}: ${err}`) })
        return;
    }

    if (!guild.id) return logger("error", "servertosettings.js", "Can't write guild to settings because guild id is undefined!"); //missing guildid will make entry unuseable

    bot.settings.findOne({ guildid: guild.id }, (err, data) => {
        //adding prefix to server nickname
        if (guild.members.cache.get(bot.user.id).nickname === null) { //bot has no nickname, start nickname with username
            var nickname = bot.user.username
        } else {
            if (!data || !data.prefix) {
                var nickname = guild.members.cache.get(String(bot.user.id).nickname) //get nickname without trying to replace old prefix if server has no entry in settings.json yet
            } else {
                var nickname = guild.members.cache.get(String(bot.user.id)).nickname.replace(` [${data.prefix}]`, "")
            }
        }

        if (bot.config.loginmode == "normal") {
            var prefix = bot.constants.DEFAULTPREFIX
        } else {
            var prefix = bot.constants.DEFAULTTESTPREFIX
        }
        
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