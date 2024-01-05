/*
 * File: guildDelete.js
 * Project: beepbot
 * Created Date: 2023-02-27 17:35:50
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-05 23:26:41
 * Modified By: 3urobeat
 *
 * Copyright (c) 2023 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require('discord.js'); //eslint-disable-line

/**
 * The guildDelete event
 * @param {Discord.Client} bot The Discord client class
 * @param {Function} logger The logger function
 * @param {Discord.Guild} guild The Discord guild class
 */
module.exports.run = async (bot, logger, guild) => { //eslint-disable-line

    bot.shard.fetchClientValues("guilds.cache.size").then(res => { // Wait for promise
        logger("info", "guildDelete.js", `I have been removed from: ${guild.name} (${guild.id}). I'm now in ${res} servers.`);
    });

    bot.fn.servertosettings(guild, true); // True argument will remove function from db

};
