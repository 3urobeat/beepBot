/*
 * File: musicstop.js
 * Project: beepbot
 * Created Date: 16.11.2021 22:43:34
 * Author: 3urobeat
 * 
 * Last Modified: 15.01.2022 20:26:24
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
 * The musicstop command
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

    if (queue) {
        queue.manualstop = true;
        queue.destroy();
    } else {
        if (message.guild.me.voice) message.guild.me.voice.disconnect(); //check if user tries to disconnect bot which is in the voice channel without having a queue
    }

    message.channel.send(lf.stopstopped)
}

module.exports.info = {
    names: ["stop"],
    description: "cmd.othermusic.stopinfodescription",
    options: [],
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false,
    allowedguilds: config.musicenabledguilds
}