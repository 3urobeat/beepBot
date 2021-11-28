/*
 * File: musicseek.js
 * Project: beepbot
 * Created Date: 16.11.2021 22:43:34
 * Author: 3urobeat
 * 
 * Last Modified: 25.11.2021 13:10:04
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

    if (!queue) return message.channel.send(lf.queueempty)


    //Try to guess and convert format the user provided
    var totaltime = 0;
    var timeargs = args[0].split(":")


    //Convert time arguments to numbers
    timeargs.forEach((e, i) => timeargs[i] = parseInt(e)) //isNaN checking would be good here


    if (timeargs.length == 1) { //user probably means seconds
        totaltime = timeargs[0]

    } else if (timeargs.length == 2) { //minutes
        totaltime = timeargs[1]
        totaltime += timeargs[0] * 60

    } else if (timeargs.length == 3) { //hours
        totaltime = timeargs[2]
        totaltime += timeargs[1] * 60
        totaltime += timeargs[0] * 3600
    }

    //Convert seconds to ms
    totaltime = totaltime * 1000

    //Check duration
    if (queue.current.durationMS < totaltime) return message.channel.send(lf.seekoutofbounds + "\n`seconds` or `minutes:seconds` or `hours:minutes:seconds`")

    queue.seek(totaltime)

    message.channel.send(lf.seekedto.replace("timestamp", totaltime / 1000))
}

module.exports.info = {
    names: ["seek"],
    description: "cmd.othermusic.seekinfodescription",
    usage: '(seconds/minutes:seconds/hours:minutes:seconds)',
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false,
    allowedguilds: config.musicenabledguilds
}