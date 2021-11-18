/*
 * File: avatar.js
 * Project: beepbot
 * Created Date: 07.08.2020 20:02:00
 * Author: 3urobeat
 * 
 * Last Modified: 18.11.2021 20:20:34
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
 * The avatar command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The recieved message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    var avataruser = fn.getuserfrommsg(message, args, 0, null, true);
    if (!avataruser) return message.channel.send(lang.general.usernotfound)
    if (typeof (avataruser) == "number") return message.channel.send(lang.general.multipleusersfound.replace("useramount", avataruser))

    var avatarurl = avataruser.displayAvatarURL();

    message.channel.send({ 
        embeds: [{
            author: {
                name: avataruser.username,
                icon_url: avatarurl,
                url: avatarurl
            },
            title: "Click here to open image in your browser",
            url: avatarurl,
            image: {
                url: avatarurl
            },
            footer: {
                icon_url: message.author.displayAvatarURL,
                text: `${lang.general.requestedby} ${message.author.username}`
            },
            timestamp: message.createdAt,
            color: fn.randomhex() 
        }] 
    })
}

module.exports.info = {
    names: ["avatar", "useravatar"],
    description: "cmd.otherinfouser.avatarinfodescription",
    usage: "[mention/username/userid]",
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false
}