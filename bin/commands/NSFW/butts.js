/*
 * File: butts.js
 * Project: beepbot
 * Created Date: 2020-10-01 18:53:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 12:49:04
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
 * The butts command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    try {
        // Note: If this API shouldn't work anymore, use nekobot: https://nekobot.xyz/api/image?type=ass
        let { body } = await superagent.get("http://api.obutts.ru/butts/0/1/random");

        let imageurl = "http://media.obutts.ru/" + body[0].preview;

        message.channel.send({
            embeds: [{
                title: lang.general.imagehyperlink,
                url: imageurl,
                image: {
                    url: imageurl
                },
                footer: {
                    text: `${lang.general.poweredby} api.obutts.ru`
                },
                timestamp: message.createdAt,
                color: bot.misc.randomHex()
            }]
        });

    } catch (err) {
        logger("error", "butts.js", "API Error: " + err);
        message.channel.send(`api.obutts.ru butts API ${lang.general.error}: ${err}`);
    }
};

module.exports.info = {
    names: ["butts", "butt", "ass"],
    description: "cmd.othernsfw.buttsinfodescription",
    usage: "",
    options: [],
    accessableby: ["all"],
    allowedindm: true,
    nsfwonly: true
};
