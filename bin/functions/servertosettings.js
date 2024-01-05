/*
 * File: servertosettings.js
 * Project: beepbot
 * Created Date: 2021-02-07 17:27:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-05 23:24:01
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
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
 * @param {boolean} removeentry Set to true if this function is called from guildDelete event. It will mark db entries for this server to expire in 7 days.
 */
module.exports.run = (bot, logger, guild, removeentry) => {

    // Helper function that avoids having to copy paste the same msg and makes changing it easier
    /**
     *
     * @param err
     */
    function logDbErr(err) { logger("error", "servertosettings.js", `Error updating db of guild ${guild.id}. Error: ${err}`); } // eslint-ignore-line no-inner-declarations

    // If removeentry is true set all db entries to expire in 7 days and stop further execution
    if (removeentry) {
        logger("info", "servertosettings.js", `Marking all database entries for guild ${guild.id} to expire in 7 days...`, false, true);

        // Add or update expireTimestamp in all databases for this guild id
        bot.settings.update(  { guildid: guild.id }, { $set: { expireTimestamp: Date.now() + 6.048e+8 } }, { multi: true }, (err) => { if (err) logDbErr(err); });
        bot.timedbans.update( { guildid: guild.id }, { $set: { expireTimestamp: Date.now() + 6.048e+8 } }, { multi: true }, (err) => { if (err) logDbErr(err); });
        bot.timedmutes.update({ guildid: guild.id }, { $set: { expireTimestamp: Date.now() + 6.048e+8 } }, { multi: true }, (err) => { if (err) logDbErr(err); });
        bot.levelsdb.update(  { guildid: guild.id }, { $set: { expireTimestamp: Date.now() + 6.048e+8 } }, { multi: true }, (err) => { if (err) logDbErr(err); });

        return;
    }


    // Check if guild id is missing as it will make the entry unuseable
    if (!guild.id) return logger("error", "servertosettings.js", "Can't write guild to settings because guild id is undefined!");


    // Reload databases to make sure removed data is not being reused
    bot.settings.loadDatabase((err)   => { if (err) return logger("warn", "servertosettings.js", "Error loading settings database: " + err); });
    bot.timedbans.loadDatabase((err)  => { if (err) return logger("warn", "servertosettings.js", "Error loading timedbans database: " + err); });
    bot.timedmutes.loadDatabase((err) => { if (err) return logger("warn", "servertosettings.js", "Error loading timedmutes database: " + err); });
    bot.levelsdb.loadDatabase((err)   => { if (err) return logger("warn", "servertosettings.js", "Error loading levelsdb database: " + err); });

    // Reset expireTimestamp for existing db entries for this guild
    bot.settings.update(  { guildid: guild.id }, { $unset: { expireTimestamp: true } }, { multi: true }, (err) => { if (err) logDbErr(err); });
    bot.timedbans.update( { guildid: guild.id }, { $unset: { expireTimestamp: true } }, { multi: true }, (err) => { if (err) logDbErr(err); });
    bot.timedmutes.update({ guildid: guild.id }, { $unset: { expireTimestamp: true } }, { multi: true }, (err) => { if (err) logDbErr(err); });
    bot.levelsdb.update(  { guildid: guild.id }, { $unset: { expireTimestamp: true } }, { multi: true }, (err) => { if (err) logDbErr(err); });


    // Fetch existing settings entry for this guild if there is one
    bot.settings.findOne({ guildid: guild.id }, (err, data) => {

        // Get current name or existing nickname to add prefix to
        let nickname;

        if (!guild.members.cache.get(bot.user.id).nickname) { // Bot has no nickname, start nickname with username
            nickname = bot.user.username;
        } else {
            if (!data || !data.prefix) nickname = guild.members.cache.get(String(bot.user.id).nickname); // Get nickname without trying to replace old prefix if server has no entry in settings db yet
                else nickname = guild.members.cache.get(String(bot.user.id)).nickname.replace(` [${data.prefix}]`, ""); // Replace old prefix in nickname
        }


        // Get the correct prefix and update nickname
        let prefix;

        if (bot.config.loginmode == "normal") prefix = bot.constants.DEFAULTPREFIX;
            else prefix = bot.constants.DEFAULTTESTPREFIX;

        if (!nickname) nickname = bot.user.username; // Since nickname can still somehow be undefined check one last time

        guild.members.cache.get(String(bot.user.id)).setNickname(`${nickname} [${prefix}]`).catch(() => {}); // Set nickname to existing name plus prefix and catch error but ignore it


        // Add entry with default settings to db if no entry exists yet
        if (!data) {
            let defaultguildsettings = bot.constants.defaultguildsettings;
            defaultguildsettings["guildid"] = guild.id;
            defaultguildsettings["prefix"] = prefix;

            logger("info", "servertosettings.js", `Adding ${guild.id} to settings database with default settings...`, false, true);

            bot.settings.insert(defaultguildsettings, (err) => { if (err) logger("error", "servertosettings.js", "Error inserting guild: " + err); });

        } else {

            logger("info", "servertosettings.js", `An existing entry was found for guild ${guild.id} in settings.db. Reusing existing entry with removed expiration timestamp.`, false, true);

        }

    });

};
