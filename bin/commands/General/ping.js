/*
 * File: ping.js
 * Project: beepbot
 * Created Date: 2020-08-02 22:07:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-12 12:21:17
 * Modified By: 3urobeat
 *
 * Copyright (c) 2020 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js"); // eslint-disable-line

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The ping command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    let msg = await message.channel.send({
        embeds: [{
            title: "Ping?",
            color: 0xFFA500
        }]
    });

    // Get heartbeat and calculate ping
    let heartbeat = bot.misc.round(bot.client.ws.ping, 2); // Seems to be broken
    let ping      = bot.misc.round(msg.createdTimestamp - message.createdTimestamp, 2);

    // Edit original message with results
    msg.edit({
        embeds: [{
            title: "Pong!",
            description: `:heartbeat: ${heartbeat}ms\n:ping_pong: ${ping}ms`,
            color: 0x32CD32
        }]
    });
};

module.exports.info = {
    names: ["ping", "pong"],
    description: "cmd.othergeneral.pinginfodescription",
    usage: "",
    options: [],
    accessableby: ["all"],
    allowedindm: true,
    nsfwonly: false
};
