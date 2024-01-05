/*
 * File: say.js
 * Project: beepbot
 * Created Date: 2020-11-29 14:24:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-05 23:13:17
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
 * The say command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {object} guildsettings All settings of this guild
 * @param {object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    if (!args[0]) return message.channel.send(lang.cmd.otherbotowner.saymissingargs);

    message.delete().catch(err => {
        return message.channel.send("Error deleting message: " + err);
    });

    message.channel.send(args.join(" "));

};

module.exports.info = {
    names: ["say"],
    description: "cmd.otherbotowner.sayinfodescription",
    usage: "(text)",
    options: [
        {
            name: "text",
            description: "The text the bot should send",
            required: true,
            type: Discord.ApplicationCommandOptionType.String
        }
    ],
    accessableby: ["botowner"],
    allowedindm: true,
    nsfwonly: false
};
