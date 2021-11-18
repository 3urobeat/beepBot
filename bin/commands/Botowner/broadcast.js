/*
 * File: broadcast.js
 * Project: beepbot
 * Created Date: 12.01.2021 18:34:00
 * Author: 3urobeat
 * 
 * Last Modified: 18.11.2021 20:19:34
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
 * The broadcast command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The recieved message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    if (!args[0]) return message.channel.send(lang.cmd.otherbotowner.saymissingargs) //same message so we are just using that

    bot.shard.broadcastEval(client => {
        client.guilds.cache.forEach((e) => {
            client.settings.findOne({ guildid: e.id }, (err, guildsettings) => {

                if (guildsettings && guildsettings.systemchannel) {
                    var channelid = guildsettings.systemchannel //check if guild has a systemchannel set in bot settings

                } else if (e.systemChannelId) {
                    var channelid = e.systemChannelId //Check for systemchannel in guild settings

                } else if (guildsettings && guildsettings.modlogchannel) {
                    var channelid = guildsettings.modlogchannel //Check if guild has a modlogchannel set in bot settings

                } else if (args[0] == "true") { //get first best channel if force is true
                    var channelid = null

                    let textchannels = e.channels.cache.filter(c => c.type == "GUILD_TEXT").sort((a, b) => a.rawPosition - b.rawPosition)
                    var channelid = textchannels.find(c => c.permissionsFor(client.user).has("SEND_MESSAGES")).id
                }
                
                if (!channelid) return; //no channel found

                e.channels.cache.get(String(channelid)).send(args.slice(1).join(" "))
            })
        })
    })

    message.channel.send(lang.cmd.otherbotowner.broadcastmessagesent)
}

module.exports.info = {
    names: ["broadcast"],
    description: "cmd.otherbotowner.broadcastinfodescription",
    usage: '(force "true"/"false") (message)',
    accessableby: ['botowner'],
    allowedindm: true,
    nsfwonly: false
}