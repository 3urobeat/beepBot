/*
 * File: guildMemberAdd.js
 * Project: beepbot
 * Created Date: 2021-02-07 17:27:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-07 19:04:57
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Bot = require("../bot.js");


/**
 * Handles discord.js's guildMemberAdd event of this shard
 */
Bot.prototype._attachDiscordGuildMemberAddEvent = function() {

    this.client.on("guildMemberAdd", (member) => {

        // Take care of greetmsg
        this.data.settings.findOne({ guildid: member.guild.id }, (err, guildsettings) => {
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

    });

};
