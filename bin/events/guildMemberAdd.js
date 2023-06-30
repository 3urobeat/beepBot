/*
 * File: guildMemberAdd.js
 * Project: beepbot
 * Created Date: 07.02.2021 17:27:00
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


// This file contains code of the guildMemberAdd event and is called by bot.js
// I did this to reduce the amount of lines in bot.js to make finding stuff easier.

const Discord = require('discord.js'); //eslint-disable-line

/**
 * The guildMemberAdd event
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.GuildMember} member The Discord guild member class
 */
module.exports.run = (bot, member) => {
    // Take care of greetmsg
    bot.settings.findOne({ guildid: member.guild.id }, (err, guildsettings) => {
        if (!guildsettings) return; // Yeah better stop if nothing was found to avoid errors

        if (guildsettings.systemchannel && guildsettings.greetmsg) {
            // Check settings.json for greetmsg, replace username and servername and send it into setting's systemchannel
            let msgtosend = guildsettings.greetmsg;

            if (msgtosend.includes("@username")) msgtosend = msgtosend.replace("@username", `<@${member.user.id}>`);
                else msgtosend = msgtosend.replace("username", member.user.username);

            msgtosend = msgtosend.replace("servername", member.guild.name);

            member.guild.channels.cache.get(String(guildsettings.systemchannel)).send(msgtosend).catch(() => {}); // Catch but ignore error
        }

        // Take care of memberaddrole
        if (guildsettings.memberaddroles.length > 0) {
            member.roles.add(guildsettings.memberaddroles); // Add all roles at once (memberaddroles is an array)
        }
    });
};