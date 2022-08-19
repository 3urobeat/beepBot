/*
 * File: musicqueue.js
 * Project: beepbot
 * Created Date: 16.11.2021 22:43:34
 * Author: 3urobeat
 * 
 * Last Modified: 19.08.2022 18:41:12
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
 * The musicpause command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The recieved message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    let lf = lang.cmd.othermusic //Should this file use his lang file path often use this var as shorthand
    const player  = require("../../player.js").player;
    
    //Check if bot is not connected or connected to a different voice channel
    if (!message.guild.me.voice.channel || message.guild.me.voice.channel.id == null) return message.channel.send(lf.botnotplaying)
    if (!message.member.voice.channel || message.member.voice.channel.id != message.guild.me.voice.channel.id) return message.channel.send(lf.connectedtodifferentchannel); //Refuse new connection

    
    var queue = player.getQueue(message.guild.id)
    
    if (!queue) return message.channel.send(lf.queueempty);

    var tracks = [...queue.tracks.values()]


    //Prepare message
    var embed = {
        title: lf.queue,
        description: "".slice(0, 2048) //cut after 2048 characters to fit into limit: https://birdie0.github.io/discord-webhooks-guide/other/field_limits.html
    }

    //Handle arguments
    switch (args[0]) {
        case "remove":
            if (!args[1]) return message.channel.send(lf.queueremovenoargs)

            var tracktoremove = tracks[parseInt(args[1]) - 1]
            if (!tracktoremove) return message.channel.send(lf.queueremoveinvalid)

            queue.remove(tracktoremove);

            message.channel.send(lf.queueremoved.replace("tracktitle", `**${tracktoremove.title}**`).replace("trackauthor", `\`${tracktoremove.author}\``))
            break;

        case "clear":
            queue.clear();
            message.channel.send(lf.queuecleared)
            break;

        default:
            embed.description = "▶ " + lf.queuecurrentsong + "\n" //Set first line to current track
            embed.description += `**${queue.current.title}** ${lang.general.by} \`${queue.current.author}\`\n`
            embed.description += queue.createProgressBar();
            embed.description += "\n"

            if (tracks.length > 0) embed.description += `\n🎶 **${lf.queuenextsongs}**`
                else embed.description += "\n" + lf.queueempty

            tracks.forEach((e, i) => {
                embed.description += `\n**${i + 1}.** ${e.title} ${lang.general.by} \`${e.author}\` | ${e.duration}`
            })

            message.channel.send({ embeds: [embed] })
    }
}

module.exports.info = {
    names: ["queue", "nowplaying", "np"],
    description: "cmd.othermusic.queueinfodescription",
    usage: '["list"/"remove" number/"clear"]',
    options: [
        {
            name: "option",
            description: "List or clear the queue",
            required: false,
            type: Discord.ApplicationCommandOptionType.String,
            choices: [
                { name: "List queue", value: "list" },
                { name: "Clear queue", value: "queue" }
            ]
        },
        {
            name: "remove",
            description: "Remove a specific element in the queue",
            required: false,
            type: Discord.ApplicationCommandOptionType.Number
        }
    ],
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false,
    allowedguilds: config.musicenabledguilds
}