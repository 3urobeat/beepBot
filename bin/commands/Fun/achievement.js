/*
 * File: achievement.js
 * Project: beepbot
 * Created Date: 2021-01-09 21:11:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-11 16:26:47
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord    = require("discord.js"); // eslint-disable-line
const superagent = require("superagent");

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The achievement command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    if (!args[0]) message.channel.send(lang.cmd.otherfun.achievementmissingargs);

    let title    = lang.cmd.otherfun.achievementtitle;
    let contents = args.join(" ");
    let rnd      = Math.floor((Math.random() * 39) + 1);

    if (contents.length > 22) return message.channel.send(lang.cmd.otherfun.achievementtoolongtext);

    try {
        let { body } = await superagent.get(`https://skinmc.net/en/achievement/${rnd}/${encodeURIComponent(title)}/${encodeURIComponent(contents)}`);

        message.channel.send({ files: [{ attachment: body }] });
    } catch (err) {
        logger("error", "achievement.js", "API Error: " + err);
        message.channel.send(`skinmc.net API ${lang.general.error}: ${err}`);
    }
};

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
    accessableby: ["all"],
    allowedindm: true,
    nsfwonly: false
};
