/*
 * File: servericon.js
 * Project: beepbot
 * Created Date: 12.01.2021 18:34:00
 * Author: 3urobeat
 * 
 * Last Modified: 17.11.2021 19:06:38
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    if (!message.guild.iconURL()) return message.channel.send(lang.cmd.otherinfouser.servericonnoicon)

    let iconurl = message.guild.iconURL();

    message.channel.send({
        embeds: [{
            title: lang.cmd.otherinfouser.servericontitle,
            url: iconurl,
            color: fn.randomhex(),
            image: { url: iconurl },
            footer: { 
                icon_url: message.author.displayAvatarURL,
                text: `${lang.general.requestedby} ${message.author.username}`
            },
            timestamp: message.createdAt
        }]
    })
}

module.exports.info = {
    names: ["servericon"],
    description: "cmd.otherinfouser.servericoninfodescription",
    usage: "",
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false
}