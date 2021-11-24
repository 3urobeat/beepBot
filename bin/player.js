/*
 * File: player.js
 * Project: beepbot
 * Created Date: 21.11.2021 15:23:47
 * Author: 3urobeat
 * 
 * Last Modified: 24.11.2021 16:56:09
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


/**
 * Initializes the discord-player module for music support
 * @param {Discord.Client} bot The Discord client class
 * @param {Function} logger The logger function
 */
module.exports.run = (bot, logger) => {
    const { Player } = require("discord-player"); //Import Player from discord-player
    const player     = new Player(bot); //create a new player instance

    module.exports.player = player; //export this player to make it accessible from the music command files

    function getLang(guild, callback) {
        //Get language object for this guild
        bot.settings.findOne({ guildid: guild.id }, async (err, guildsettings) => {
            callback(bot.fn.lang(guild.id, guildsettings))
        })
    }


    //Handle various discord-player events
    
    player.on('error', (queue, error) => {
        logger("error", "player.js", `Error emitted from queue for guild ${queue.guild.id}:\n${error.message}`)

        getLang(queue.guild, (lang) => {
            queue.metadata.channel.send(lang.general.error + error.message + "\n" + lang.general.pleasetryagain)
        })
    });
      
    player.on('connectionError', (queue, error) => {
        logger("error", "player.js", `Error emitted from connection for guild ${queue.guild.id}:\n${error.message}`)
        
        getLang(queue.guild, (lang) => {
            queue.metadata.channel.send(lang.general.error + error.message + "\n" + lang.general.pleasetryagain)
        })
    });
    
    player.on('trackStart', (queue, track) => {
        getLang(queue.guild, (lang) => {
            queue.metadata.channel.send("▶ " + lang.cmd.othermusic.playernowplaying.replace("tracktitle", `**${track.title}**`).replace("trackauthor", `\`${track.author}\``))
        })
    });
    
    player.on('trackAdd', (queue, track) => {
        getLang(queue.guild, (lang) => {
            queue.metadata.channel.send("🎶 " + lang.cmd.othermusic.playeraddedtoqueue.replace("tracktitle", `**${track.title}**`).replace("trackauthor", `\`${track.author}\``))
        })
    });

    player.on('channelEmpty', queue => {
        getLang(queue.guild, (lang) => {
            queue.metadata.channel.send("⏹️ " + lang.cmd.othermusic.playerchannelempty)
        })
    });

    player.on('queueEnd', queue => {
        if (queue.manualstop) return; //don't print message if queue was manually destroyed
        if ([...queue.connection.channel.members.keys()].length == 1) return; //dont send message if no one is in the channel anymore (except the bot)

        getLang(queue.guild, (lang) => {
            queue.metadata.channel.send("✅ " + lang.cmd.othermusic.playerqueueend)
        })
    });
    
    //Disabled events
    //player.on('botDisconnect', queue => { }); //tiggered on manual disconnect
}