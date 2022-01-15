/*
 * File: magic8.js
 * Project: beepbot
 * Created Date: 07.10.2020 20:44:00
 * Author: 3urobeat
 * 
 * Last Modified: 15.01.2022 15:18:28
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


const Discord = require('discord.js'); //eslint-disable-line

/**
 * The magic8 command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The recieved message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    if (!args[0]) return message.channel.send(lang.cmd.otherfun.magic8missingargs)
    
    message.channel.send(":8ball: " + fn.randomstring(lang.cmd.otherfun.magic8responses))
}

module.exports.info = {
    names: ["magic8", "8ball", "8b"],
    description: "cmd.otherfun.magic8infodescription",
    options: [
        {
            name: "question",
            description: "The question to ask the magic 8ball",
            required: true,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING
        }
    ],
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}