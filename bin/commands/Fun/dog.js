/*
 * File: dog.js
 * Project: beepbot
 * Created Date: 2022-01-12 14:02:07
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-05 23:10:31
 * Modified By: 3urobeat
 *
 * Copyright (c) 2022 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require('discord.js'); //eslint-disable-line

/**
 * The dog command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    try {
        let { body } = await require("superagent").get("https://random.dog/woof.json");

        message.channel.send({
            embeds: [{
                title: lang.general.imagehyperlink,
                url: body.url,
                image: {
                    url: body.url
                },
                footer: {
                    text: `${lang.general.poweredby} random.dog API`
                },
                timestamp: message.createdAt,
                color: fn.randomhex()
            }]
        });

    } catch (err) {
        logger("error", "dog.js", "API Error: " + err);
        message.channel.send(`random.dog API ${lang.general.error}: ${err}`);
    }
};

module.exports.info = {
    names: ["dog", "woof"],
    description: "cmd.otherfun.doginfodescription",
    usage: "",
    options: [],
    accessableby: ["all"],
    allowedindm: true,
    nsfwonly: false
};
