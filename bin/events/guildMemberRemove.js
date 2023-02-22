/*
 * File: guildMemberRemove.js
 * Project: beepbot
 * Created Date: 07.02.2021 17:27:00
 * Author: 3urobeat
 *
 * Last Modified: 18.11.2021 20:24:07
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// This file contains code of the servertosettings function and is called by bot.js
// I did this to reduce the amount of lines in bot.js to make finding stuff easier.

const Discord = require('discord.js'); //eslint-disable-line

/**
 * The guildMemberRemove event
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.GuildMember} member The Discord guild member class
 */
module.exports.run = (bot, member) => {
    bot.settings.findOne({ guildid: member.guild.id }, (err, guildsettings) => {
        if (!guildsettings) return; // Yeah better stop if nothing was found to avoid errors
        if (!guildsettings.systemchannel) return;
        if (!guildsettings.byemsg) return;

        let msgtosend = String(guildsettings.byemsg);
        msgtosend = msgtosend.replace("username", member.user.username);
        msgtosend = msgtosend.replace("servername", member.guild.name);

        let channel = member.guild.channels.cache.get(String(guildsettings.systemchannel));

        if (!channel) return;
        channel.send(msgtosend).catch(() => {}); // Catch but ignore error
    });
};