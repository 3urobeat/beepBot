/*
 * File: pgif.js
 * Project: beepbot
 * Created Date: 2020-10-01 18:53:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 12:49:02
 * Modified By: 3urobeat
 *
 * Copyright (c) 2020 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord    = require("discord.js"); // eslint-disable-line
const superagent = require("superagent");

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The pgif command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    try {
        let { body } = await superagent.get("https://nekobot.xyz/api/image?type=pgif");

        message.channel.send({
            embeds: [{
                title: lang.general.imagehyperlink,
                url: body.message,
                image: {
                    url: body.message
                },
                footer: {
                    text: `${lang.general.poweredby} NekoBot API`
                },
                timestamp: message.createdAt,
                color: bot.misc.randomHex()
            }]
        });

    } catch (err) {
        logger("error", "pgif.js", "API Error: " + err);
        message.channel.send(`nekobot.xyz pgif API ${lang.general.error}: ${err}`);
    }
};

module.exports.info = {
    names: ["pgif", "porngif"],
    description: "cmd.othernsfw.pgifinfodescription",
    usage: "",
    options: [],
    accessableby: ["all"], // Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: true
};
