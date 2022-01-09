/*
 * File: levelUser.js
 * Project: beepbot
 * Created Date: 09.01.2022 10:12:16
 * Author: 3urobeat
 * 
 * Last Modified: 09.01.2022 12:24:39
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2022 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


const Discord = require('discord.js'); //eslint-disable-line
const nedb    = require("@yetzt/nedb"); //eslint-disable-line

var xpHistory = {}; //store recent xp increments in an object

/**
 * Handles the xp addition and level up messages
 * @param {Discord.Client} bot The Discord client class
 * @param {Function} logger The logger function
 * @param {Discord.Message} message The Discord message class
 * @param {nedb} guildsettings The guildsettings object of the guild the message comes from
 */
module.exports.levelUser = (bot, logger, message, guildsettings) => { //eslint-disable-line

    //don't bother if the user got XP in the last 60 seconds to prevent leveling by spamming 
    if (xpHistory[message.guild.id] && xpHistory[message.guild.id][message.author.id] && xpHistory[message.guild.id][message.author.id] + 5000 >= Date.now()) {
        //logger("debug", "levelUser.js", `XP addition for ${message.author.id} in guild ${message.guild.id} more recent than 60 secs`);
        return;
    }
    
    //random xp amount between 15 and 25 xp
    var xpAmount = Math.floor(Math.random() * (25 - 15 + 1) + 15);

    //log debug message
    //logger("debug", "levelUser.js", `Adding ${xpAmount}xp to user ${message.author.id} in guild ${message.guild.id}`)

    //increment xp and messages amount for entry that matches this user's id and this guild id
    bot.levelsdb.update({ $and: [{ userid: message.author.id }, { guildid: message.guild.id }] }, { $inc: { xp: xpAmount, messages: 1 }, $set: { userid: message.author.id, guildid: message.guild.id } }, { upsert: true }, (err) => { 
        if (err) logger("error", "levelUser.js", `Error updating db of guild ${message.guild.id}. Error: ${err}`) 
    })
    
    //add this action to the xpHistory obj (first check if entry for this guild and user exists, if not then create it)
    if (!xpHistory[message.guild.id]) xpHistory[message.guild.id] = {}
    if (!xpHistory[message.guild.id][message.author.id]) xpHistory[message.guild.id][message.author.id] = 0;

    xpHistory[message.guild.id][message.author.id] = Date.now();
}