/*
 * File: avatar.js
 * Project: beepbot
 * Created Date: 2020-08-07 20:02:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-12 12:02:59
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
 * The avatar command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    let avataruser = bot.getUserFromMsg(message, args, 0, null, true);
    if (!avataruser) return message.channel.send(lang.general.usernotfound);
    if (typeof (avataruser) == "number") return message.channel.send(lang.general.multipleusersfound.replace("useramount", avataruser));

    let avatarurl = avataruser.displayAvatarURL();

    message.channel.send({
        embeds: [{
            author: {
                name: avataruser.username,
                icon_url: avatarurl, // eslint-disable-line camelcase
                url: avatarurl
            },
            title: "Click here to open image in your browser",
            url: avatarurl,
            image: {
                url: avatarurl
            },
            footer: {
                icon_url: message.author.displayAvatarURL, // eslint-disable-line camelcase
                text: `${lang.general.requestedby} @${message.author.displayName}`
            },
            timestamp: message.createdAt,
            color: bot.misc.randomHex()
        }]
    });
};

module.exports.info = {
    names: ["avatar", "useravatar"],
    description: "cmd.otherinfouser.avatarinfodescription",
    usage: "[mention/username/userid]",
    options: [
        {
            name: "user",
            description: "Gets the avatar of a specific user",
            required: false,
            type: Discord.ApplicationCommandOptionType.User
        }
    ],
    accessableby: ["all"],
    allowedindm: false,
    nsfwonly: false
};
