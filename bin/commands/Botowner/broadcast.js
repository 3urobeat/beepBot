/*
 * File: broadcast.js
 * Project: beepbot
 * Created Date: 2021-01-12 18:34:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 12:14:36
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js"); // eslint-disable-line

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The broadcast command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    if (!args[0]) return message.channel.send(lang.cmd.otherbotowner.saymissingargs); // Same message so we are just using that

    bot.client.shard.broadcastEval((client, context) => {
        client.guilds.cache.forEach((e) => {
            client.bot.data.settings.findOne({ guildid: e.id }, (err, guildsettings) => {
                let channelID;

                if (guildsettings && guildsettings.systemchannel) {
                    channelID = guildsettings.systemchannel; // Check if guild has a systemchannel set in bot settings

                } else if (e.systemChannelId) {
                    channelID = e.systemChannelId; // Check for systemchannel in guild settings

                } else if (guildsettings && guildsettings.modlogchannel) {
                    channelID = guildsettings.modlogchannel; // Check if guild has a modlogchannel set in bot settings

                } else if (context.args[0] == "true") { // Get first best channel if force is true
                    channelID = null;

                    let textchannels = e.channels.cache.filter(c => c.type == Discord.ChannelType.GuildText).sort((a, b) => a.rawPosition - b.rawPosition);
                    channelID = textchannels.find(c => c.permissionsFor(client.user).has(Discord.PermissionFlagsBits.SendMessages)).id;
                }

                if (!channelID) return; // No channel found

                e.channels.cache.get(String(channelID)).send(context.args.slice(1).join(" "));
            });
        });
    }, { context: { args: args } }); // Pass args as context to be able to access it inside)

    message.channel.send(lang.cmd.otherbotowner.broadcastmessagesent);
};

module.exports.info = {
    names: ["broadcast"],
    description: "cmd.otherbotowner.broadcastinfodescription",
    usage: '(force "true"/"false") (message)',
    options: [
        {
            name: "force",
            description: "Force this message to be sent even if no suitable channel was found (will use first channel with permission to send messages)",
            required: true,
            type: Discord.ApplicationCommandOptionType.Boolean
        },
        {
            name: "message",
            description: "The message that should be broadcasted",
            required: true,
            type: Discord.ApplicationCommandOptionType.String
        }
    ],
    accessableby: ["botowner"],
    allowedindm: true,
    nsfwonly: false
};
