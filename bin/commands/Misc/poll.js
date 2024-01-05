/*
 * File: poll.js
 * Project: beepbot
 * Created Date: 2020-08-07 20:02:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-05 23:21:32
 * Modified By: 3urobeat
 *
 * Copyright (c) 2020 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require('discord.js'); //eslint-disable-line

/**
 * The poll command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {object} guildsettings All settings of this guild
 * @param {object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    await message.react("👍").catch(err => {
        message.channel.send("poll react error: " + err);
        return;
    });

    await message.react("👎").catch(err => {
        message.channel.send("poll react error: " + err);
        return;
    });

    await message.react("🤷").catch(err => {
        message.channel.send("poll react error: " + err);
        return;
    });
};

module.exports.info = {
    names: ["poll", "vote", "survey"],
    description: "cmd.othermisc.pollinfodescription",
    usage: "(description)",
    options: [
        {
            name: "description",
            description: "The topic of your poll",
            required: true,
            type: Discord.ApplicationCommandOptionType.String
        }
    ],
    accessableby: ["all"],
    allowedindm: false,
    nsfwonly: false
};
