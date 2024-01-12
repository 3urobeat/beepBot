/*
 * File: urbandictionary.js
 * Project: beepbot
 * Created Date: 2021-01-09 21:11:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-12 16:16:53
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
 * The urbandictionary command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    try {
        if (!args[0]) return message.channel.send(lang);

        let { body } = await superagent.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(args.join(" "))}`);
        let res      = body.list[0];

        if (!res) return message.channel.send(lang.cmd.othermisc.udnotfound); // Send nothing found message if array is empty

        message.channel.send({
            embeds: [{
                title: res.word + " - Urban Dictionary",
                url: res.permalink,
                color: bot.misc.randomHex(),
                description: "** **", // Produces an empty field which looks better
                fields: [
                    {
                        name: lang.cmd.othermisc.uddefinition,
                        value: res.definition
                    },
                    {
                        name: `${lang.general.example}:`,
                        value: res.example
                    }
                ],
                footer: {
                    text: `${lang.general.by} ${res.author}`
                },
                timestamp: res.written_on
            }]
        });

    } catch (err) {
        logger("error", "urbandictionary.js", "API Error: " + err);
        message.channel.send(`urbandictionary API ${lang.general.error}: ${err}`);
    }
};

module.exports.info = {
    names: ["urban", "urbandictionary", "ud"],
    description: "cmd.othermisc.udinfodescription",
    usage: "(search word)",
    options: [
        {
            name: "search-word",
            description: "What to search the urban dictionary",
            required: true,
            type: Discord.ApplicationCommandOptionType.String
        },
    ],
    accessableby: ["all"],
    allowedindm: true,
    nsfwonly: false
};
