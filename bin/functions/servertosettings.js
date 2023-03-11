/*
 * File: servertosettings.js
 * Project: beepbot
 * Created Date: 07.02.2021 17:27:00
 * Author: 3urobeat
 *
 * Last Modified: 11.03.2023 22:08:52
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// This file contains code of the servertosettings function and is called by bot.js
// I did this to reduce the amount of lines in bot.js to make finding stuff easier.

const Discord = require('discord.js'); //eslint-disable-line

/**
 * The servertosettings helper function
 * @param {Discord.Client} bot The Discord client class
 * @param {Function} logger Reference to the logger function
 * @param {Discord.Guild} guild The Discord guild class
 * @param {Boolean} removeentry Set to true if this function is called from guildDelete event. It will mark db entries for this server to expire in 7 days.
 */
module.exports.run = (bot, logger, guild, removeentry) => {

    // If removeentry is true set all db entries to expire in 7 days and stop further execution
    if (removeentry) {
        logger("info", "servertosettings.js", `Marking all database entries for guild ${guild.id} to expire in 7 days...`, false, true);

        // Helper function that avoids having to copy paste the same msg and makes changing it easier
        function logDbErr(err) { logger("error", "servertosettings.js", `Error updating db of guild ${guildid}. Error: ${err}`); }

        // Add or update expireTimestamp in all databases for this guild id
        bot.settings.update(  { guildid: guild.id }, { $set: { expireTimestamp: Date.now() + 6.048e+8 } }, { multi: true }, (err) => { if (err) logDbErr(err); });
        bot.timedbans.update( { guildid: guild.id }, { $set: { expireTimestamp: Date.now() + 6.048e+8 } }, { multi: true }, (err) => { if (err) logDbErr(err); });
        bot.timedmutes.update({ guildid: guild.id }, { $set: { expireTimestamp: Date.now() + 6.048e+8 } }, { multi: true }, (err) => { if (err) logDbErr(err); });
        bot.levelsdb.update(  { guildid: guild.id }, { $set: { expireTimestamp: Date.now() + 6.048e+8 } }, { multi: true }, (err) => { if (err) logDbErr(err); });
        
        return;
    }

    
    if (!guild.id) return logger("error", "servertosettings.js", "Can't write guild to settings because guild id is undefined!"); // Missing guildid will make entry unuseable

    bot.settings.findOne({ guildid: guild.id }, (err, data) => {
        // Adding prefix to server nickname
        if (guild.members.cache.get(bot.user.id).nickname === null) { // Bot has no nickname, start nickname with username
            var nickname = bot.user.username;
        } else {
            if (!data || !data.prefix) {
                var nickname = guild.members.cache.get(String(bot.user.id).nickname); // Get nickname without trying to replace old prefix if server has no entry in settings.json yet
            } else {
                var nickname = guild.members.cache.get(String(bot.user.id)).nickname.replace(` [${data.prefix}]`, "");
            }
        }

        if (bot.config.loginmode == "normal") {
            var prefix = bot.constants.DEFAULTPREFIX;
        } else {
            var prefix = bot.constants.DEFAULTTESTPREFIX;
        }

        if (nickname == undefined) var nickname = bot.user.username; // Since nickname can still somehow be undefined check one last time
        guild.members.cache.get(String(bot.user.id)).setNickname(`${nickname} [${prefix}]`).catch(() => {}); // Catch error but ignore it

        let defaultguildsettings = bot.constants.defaultguildsettings;
        defaultguildsettings["guildid"] = guild.id;
        defaultguildsettings["prefix"] = prefix;

        logger("info", "servertosettings.js", `Adding ${guild.id} to settings database with default settings...`, false, true);
        if (data) bot.settings.remove({ guildid: guild.id }, (err) => { if (err) logger("error", "servertosettings.js", `Error removing guild ${guild.id}: ${err}`); });

        bot.settings.insert(defaultguildsettings, (err) => { if (err) logger("error", "servertosettings.js", "Error inserting guild: " + err); });
    });

};