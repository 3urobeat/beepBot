/*
 * File: joke.js
 * Project: beepbot
 * Created Date: 06.09.2021 13:12:42
 * Author: 3urobeat
 *
 * Last Modified: 19.01.2022 13:38:10
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
 * The joke command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The recieved message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    var https = require("https");

    var options = {
        hostname: "icanhazdadjoke.com",
        port: 443,
        method: "GET",
        headers: { "Accept": "application/json" }
    };

    var req = https.request(options, res => {
        res.on("data", (data) => {
            message.channel.send(JSON.parse(data).joke);
        });
    });

    req.on("error", (err) => {
        logger("error", "joke.js", "API Error: " + err);
        message.channel.send(`icanhazdadjoke.com API ${lang.general.error}: ${err}`);
    });

    req.end();
};

module.exports.info = {
    names: ["joke", "dadjoke", "jokes"],
    description: "cmd.otherfun.jokeinfodescription",
    usage: "",
    options: [],
    accessableby: ["all"],
    allowedindm: true,
    nsfwonly: false
};