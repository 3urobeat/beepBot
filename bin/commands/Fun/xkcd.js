/*
 * File: xkcd.js
 * Project: beepbot
 * Created Date: 16.12.2021 11:31:39
 * Author: 3urobeat
 *
 * Last Modified: 30.06.2023 09:44:28
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require('discord.js'); //eslint-disable-line

var maxNum = 0;
var lastMaxNumRefresh = 0;

/**
 * The xkcd command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    // Refresh maxNum every 24 hours to be able to get a random comic
    if (lastMaxNumRefresh + 86400000 <= Date.now()) {
        let { body } = await require("superagent").get("https://xkcd.com/info.0.json");

        maxNum = body.num;
    }


    // Create template message
    var msg = {
        embeds: [{
            title: "",
            description: "",
            url: "",
            image: {
                url: ""
            },
            footer: {
                text: ""
            }
        }]
    };


    try {

        // Send random xkcd, specifc one or todays comic
        if (args[0] && args[0] == "random") {

            var random = Math.floor(Math.random() * maxNum) + 1; // Get ra random number between 0 and maxNum

            let { body } = await require("superagent").get(`https://xkcd.com/${random}/info.0.json`);

            // Make dates great again
            if (body.day < 10) body.day = "0" + body.day.toString();
            if (body.month < 10) body.month = "0" + body.month.toString();

            msg.embeds[0].title       = body.safe_title;
            msg.embeds[0].description = body.alt;
            msg.embeds[0].url         = "https://xkcd.com/" + random;
            msg.embeds[0].image.url   = body.img;
            msg.embeds[0].footer.text = `XKCD #${body.num} - ${body.day}.${body.month}.${body.year}`;

            message.channel.send(msg);

        } else if (args[0] && !isNaN(Number(args[0]))) {

            // Check if provided ID is greater than the latest released comic
            if (Number(args[0]) > maxNum) return message.channel.send(lang.cmd.otherfun.xkcdidnotfound);

            let { body } = await require("superagent").get(`https://xkcd.com/${Number(args[0])}/info.0.json`);

            // Make dates great again
            if (body.day < 10) body.day = "0" + body.day.toString();
            if (body.month < 10) body.month = "0" + body.month.toString();

            msg.embeds[0].title       = body.safe_title;
            msg.embeds[0].description = body.alt;
            msg.embeds[0].url         = "https://xkcd.com/" + random;
            msg.embeds[0].image.url   = body.img;
            msg.embeds[0].footer.text = `XKCD #${body.num} - ${body.day}.${body.month}.${body.year}`;

            message.channel.send(msg);

        } else {

            let { body } = await require("superagent").get("https://xkcd.com/info.0.json");

            // Make dates great again
            if (body.day < 10) body.day = "0" + body.day.toString();
            if (body.month < 10) body.month = "0" + body.month.toString();

            msg.embeds[0].title       = body.safe_title;
            msg.embeds[0].description = body.alt;
            msg.embeds[0].url         = "https://xkcd.com/" + body.num;
            msg.embeds[0].image.url   = body.img;
            msg.embeds[0].footer.text = `XKCD #${body.num} - ${body.day}.${body.month}.${body.year}`;

            message.channel.send(msg);

        }

    } catch (err) {
        logger("error", "xkcd.js", "API Error: " + err);
        message.channel.send(`xkcd.com API ${lang.general.error}: ${err}`);
    }

};

module.exports.info = {
    names: ["xkcd"],
    description: "cmd.otherfun.xkcdinfodescription",
    usage: "[comicID/\"random\"]",
    options: [
        {
            name: "random",
            description: "Gets a random comic instead of the latest one",
            required: false,
            type: Discord.ApplicationCommandOptionType.Boolean
        },
        {
            name: "id",
            description: "Gets a specific comic by ID instead of the latest one",
            required: false,
            type: Discord.ApplicationCommandOptionType.Number
        }
    ],
    accessableby: ["all"],
    allowedindm: true,
    nsfwonly: false
};