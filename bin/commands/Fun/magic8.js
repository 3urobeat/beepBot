/*
 * File: magic8.js
 * Project: beepbot
 * Created Date: 2020-10-07 20:44:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-11 16:26:11
 * Modified By: 3urobeat
 *
 * Copyright (c) 2020 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js"); // eslint-disable-line

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The magic8 commandjoke
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    if (!args[0]) return message.channel.send(lang.cmd.otherfun.magic8missingargs);

    message.channel.send(":8ball: " + bot.misc.randomString(lang.cmd.otherfun.magic8responses));
};

module.exports.info = {
    names: ["magic8", "8ball", "8b"],
    description: "cmd.otherfun.magic8infodescription",
    usage: "(question)",
    options: [
        {
            name: "question",
            description: "The question to ask the magic 8ball",
            required: true,
            type: Discord.ApplicationCommandOptionType.String
        }
    ],
    accessableby: ["all"],
    allowedindm: true,
    nsfwonly: false
};
