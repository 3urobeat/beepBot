/*
 * File: dice.js
 * Project: beepbot
 * Created Date: 2020-08-07 20:02:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-05 23:22:04
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
 * The dice command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {object} guildsettings All settings of this guild
 * @param {object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    let messagecount = parseInt(args[0]);
    let randomnumber = Math.floor((Math.random() * messagecount) + 1);

    let nomaxprovided = lang.cmd.othermisc.dicenomaxprovided;

    if (!args[0]) return message.channel.send(nomaxprovided);
    if (isNaN(messagecount)) return message.channel.send(nomaxprovided);
    if (messagecount < 2) return message.channel.send(nomaxprovided);

    message.channel.send(":game_die: " + fn.randomstring(lang.cmd.othermisc.dicerandommsg) + " **" + randomnumber + "**");
    return;
};

module.exports.info = {
    names: ["dice", "roll"],
    description: "cmd.othermisc.diceinfodescription",
    usage: "(limit)",
    options: [
        {
            name: "limit",
            description: "Set the maximum result possible",
            required: true,
            type: Discord.ApplicationCommandOptionType.Number
        }
    ],
    accessableby: ["all"], // Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false
};
