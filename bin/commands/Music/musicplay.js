/*
 * File: musicplay.js
 * Project: beepbot
 * Created Date: 16.11.2021 22:43:34
 * Author: 3urobeat
 * 
 * Last Modified: 24.11.2021 15:28:53
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


const Discord      = require('discord.js'); //eslint-disable-line

/**
 * The musicplay command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The recieved message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    const lf = lang.cmd.othermusic //Should this file use his lang file path often use this var as shorthand
    const servers = require("../../bot.js").servers;
    const player  = require("../../player.js").player;

    //Check if this server doesn't have an entry yet in the servers storage
    if (!servers[message.guild.id]) servers[message.guild.id] = {};

    const thisserver = servers[message.guild.id];

    if (!thisserver.queue) thisserver.queue = [];
    if (!thisserver.volume) thisserver.volume = 50;


    //Check if bot can join the voice channel
    if (!message.member.voice.channel) return message.channel.send(lf.usernotinchannel) //check if the user is in a voice channel
    if (message.member.voice.channel.full || !message.member.voice.channel.joinable) message.channel.send(lf.channelnotjoinable) //Check if bot can't join the channel

    //Check if bot is already connected to a different voice channel
    if((message.guild.me.voice.channel && message.guild.me.voice.channel.id != null) && message.member.voice.channel.id != message.guild.me.voice.channel.id) return message.channel.send(lf.alreadyconnectedtochannel); //Refuse new connection


    //try to establish connection using discord-player
    var searchword = args.slice(0).join(" ")
    var queue = player.createQueue(message.guild, {
        ytdlOptions: {
            quality: "highest",
            filter: "audioonly",
            highWaterMark: 1 << 25,
            dlChunkSize: 0,
        },
        leaveOnEmptyCooldown: 30000, //leave after 30 seconds if voice channel is empty
        metadata: { channel: message.channel } //add the text channel as metadata to make sending messages to that channel from player.js easy
    })
    
    try {
        if (!queue.connection) await queue.connect(message.member.voice.channel);

    } catch (err) {
        //Connection seems to have failed, so lets return an error and destroy the connection (cleaning time!)
        queue.destroy();
        message.channel.send(`${lf.connectiontochannelfailed}\n${lang.general.error}: ${err}`)
        logger("error", "musicplay.js", "Error connecting to channel: " + err)
        return;
    }


    //Try to find track the user searched for
    var searchmsg = await message.channel.send(`${lf.playsearchingfor} \`${searchword}\`...`);

    var track = await player.search(searchword, {
        requestedBy: message.author
    }).then(res => res.tracks[0])

    //Play track or respond with error if no track was found
    if (track) queue.play(track);
        else return searchmsg.edit("❌ " + lf.playnoresultsfound);

    return searchmsg.edit("⏱️ " + lf.playtrackloading.replace("tracktitle", `**${track.title}**`));

}

module.exports.info = {
    names: ["play"],
    description: "cmd.othermusic.playinfodescription",
    usage: '(search word/direct link)',
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false,
    allowedguilds: config.musicenabledguilds
}