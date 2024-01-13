/*
 * File: birb.js
 * Project: beepbot
 * Created Date: 2022-01-12 14:01:56
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-11 16:57:23
 * Modified By: 3urobeat
 *
 * Copyright (c) 2022 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord    = require("discord.js"); // eslint-disable-line
const superagent = require("superagent");

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The birb command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    try {

        // Temp disabled
        return message.channel.send("Command currently disabled because API Endpoint is broken. Sorry!");

        let { text } = await superagent.get("https://some-random-api.com/img/bird");

        text = JSON.parse(text);

        message.channel.send({
            embeds: [{
                title: lang.general.imagehyperlink,
                url: text.link,
                image: {
                    url: text.link
                },
                footer: {
                    text: `${lang.general.poweredby} some-random-api.com API`
                },
                timestamp: message.createdAt,
                color: bot.misc.randomHex()
            }]
        });

    } catch (err) {
        logger("error", "birb.js", "API Error: " + err);
        message.channel.send(`some-random-api.com API ${lang.general.error}: ${err}`);
    }
};

module.exports.info = {
    names: ["birb", "bird", "parrot"],
    description: "cmd.otherfun.birbinfodescription",
    usage: "",
    options: [],
    accessableby: ["all"],
    allowedindm: true,
    nsfwonly: false
};
