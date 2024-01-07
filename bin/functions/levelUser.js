/*
 * File: levelUser.js
 * Project: beepbot
 * Created Date: 2022-01-09 10:12:16
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-07 23:22:56
 * Modified By: 3urobeat
 *
 * Copyright (c) 2022 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js"); //eslint-disable-line

const DataManager = require("../dataManager.js");

let xpHistory = {}; // Store recent xp increments in an object


/**
 * Handles the xp addition and level up messages
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.User} author The user who sent the message
 * @param {Discord.Guild} guild The guild of the message
 * @param {Discord.GuildChannel} channel The channel in which the message was sent
 */
DataManager.prototype.levelUser = async function(bot, author, guild, channel) {

    // Get guild settings to find out if levelSystem is enabled
    let guildSettings = await this.settings.findOneAsync({ guildid: guild.id });

    if (!guildSettings) return logger("error", "levelUser.js", `Cannot update level of user '${author.id}' because their guild '${guild.id}' has no settings entry!`);


    // Only increment messages count if level system has been disabled or if last xp gain is more recent than 30 secs
    if (!guildSettings.levelsystem || (xpHistory[guild.id] && xpHistory[guild.id][author.id] && xpHistory[guild.id][author.id] + 30000 >= Date.now())) {
        logger("debug", "levelUser.js", `Only incrementing messages: Level system disabled or XP addition for ${author.id} in guild ${guild.id} more recent than 30 secs`);

        // Increment xp and messages amount for entry that matches this user's id and this guild id
        bot.levelsdb.update({ $and: [{ userid: author.id }, { guildid: guild.id }] },
            { $inc: { messages: 1 }, $set: { userid: author.id, guildid: guild.id, username: `${author.username}#${author.discriminator}` } },
            { upsert: true },
            (err) => {

            if (err) logger("error", "levelUser.js", `Error updating db of guild ${guild.id}. Error: ${err}`);

            });

    } else {

        // Random xp amount between 15 and 25 xp
        let xpAmount = Math.floor(Math.random() * (25 - 15 + 1) + 15);

        // Log debug message
        logger("debug", "levelUser.js", `Adding ${xpAmount}xp to user ${author.id} in guild ${guild.id}`);

        // Increment xp and messages amount for entry that matches this user's id and this guild id
        bot.levelsdb.update({ $and: [{ userid: author.id }, { guildid: guild.id }] },
            { $inc: { xp: xpAmount, messages: 1 }, $set: { userid: author.id, guildid: guild.id, username: `${author.username}#${author.discriminator}` } },
            { upsert: true, returnUpdatedDocs: true },
            async (err, numAffected, doc) => {

                if (err) logger("error", "levelUser.js", `Error updating db of guild ${guild.id}. Error: ${err}`);

                // Add this action to the xpHistory obj (first check if entry for this guild and user exists, if not then create it)
                if (!xpHistory[guild.id]) xpHistory[guild.id] = {};
                if (!xpHistory[guild.id][author.id]) xpHistory[guild.id][author.id] = 0;

                xpHistory[guild.id][author.id] = Date.now();

                // Send level up message if user reached new level (except for level 1, you only need one message to get it, that would be stupid)
                if (Math.floor(this.xpToLevel(doc.xp)) > 1 && Math.floor(this.xpToLevel(doc.xp)) > Math.floor(this.xpToLevel(doc.xp - xpAmount))) {
                    let lang = await this.getLang(guild.id);

                    channel.send(lang.general.levelupmsg.replace("username", author.username).replace("leveltext", Math.floor(this.xpToLevel(doc.xp))));
                }

            });
    }

};


/**
 * Takes user xp and returns their level
 * @param {number} xp The current total XP
 * @returns {number} Current level
 */
DataManager.prototype.xpToLevel = function(xp) {

    // Use two different functions from level 0-47 and 48-100
    if (xp <= 226305) return 0.2869 * Math.pow(xp, 0.415); // Lvl 47 and lower
        else return 0.2869 * Math.pow(xp, 0.402) + 7;

    // My friend and I spent a solid hour trying to balance the XP level calculation to match Mee6's table as closely as possible but just ended up using two functions: https://github.com/Mee6/Mee6-documentation/blob/master/docs/levels_xp.md
};


/**
 * Takes user level and returns their total xp
 * @param {number} level The level to get the xp of
 * @returns {number} Current total xp
 */
DataManager.prototype.levelToXp = function(level) {

    // Use two different functions from level 0-47 and 48-100
    if (level <= 47) return 20.2616 * Math.pow(level, 2.40964); // Lvl 47 and lower
        else return 22.3321 * Math.pow(level - 7, 2.48756);
};
