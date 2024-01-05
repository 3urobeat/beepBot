/*
 * File: ping.js
 * Project: beepbot
 * Created Date: 2020-08-02 22:07:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-05 23:06:27
 * Modified By: 3urobeat
 *
 * Copyright (c) 2020 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require('discord.js'); //eslint-disable-line

/**
 * The ping command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {object} guildsettings All settings of this guild
 * @param {object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    let msg = await message.channel.send({
        embeds: [{
            title: "Ping?",
            color: 0xFFA500
        }]
    });

    // Get heartbeat and calculate ping
    let botheartbeat = fn.round(bot.ws.ping, 2);
    let botpingpong  = fn.round(msg.createdTimestamp - message.createdTimestamp, 2);

    // Edit original message with results
    msg.edit({
        embeds: [{
            title: "Pong!",
            description:":heartbeat: " + botheartbeat + "ms\n:ping_pong: " + botpingpong + "ms",
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
