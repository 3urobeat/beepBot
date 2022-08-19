/*
 * File: achievement.js
 * Project: beepbot
 * Created Date: 09.01.2021 21:11:00
 * Author: 3urobeat
 * 
 * Last Modified: 19.08.2022 18:41:01
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
 * The achievement command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The recieved message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line   
    if (!args[0]) message.channel.send(lang.cmd.otherfun.achievementmissingargs)

    let title    = lang.cmd.otherfun.achievementtitle
    let contents = args.join(" ")
    let rnd      = Math.floor((Math.random() * 39) + 1);
    
    if (contents.length > 22) return message.channel.send(lang.cmd.otherfun.achievementtoolongtext)

    try {
        let { body } = await require("superagent").get(`https://www.minecraftskinstealer.com/achievement/a.php?i=${rnd}&h=${encodeURIComponent(title)}&t=${encodeURIComponent(contents)}`)

        message.channel.send({ files: [{ attachment: body }] })
    } catch (err) {
        logger("error", "achievement.js", "API Error: " + err)
        message.channel.send(`minecraftskinstealer.com API ${lang.general.error}: ${err}`) 
    }
}

module.exports.info = {
    names: ["achievement"],
    description: "cmd.otherfun.achievementinfodescription",
    usage: "(text)",
    options: [
        {
            name: "text",
            description: "The text to display in the achievement",
            required: true,
            type: Discord.ApplicationCommandOptionType.String
        }
    ],
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}