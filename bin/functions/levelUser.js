/*
 * File: levelUser.js
 * Project: beepbot
 * Created Date: 09.01.2022 10:12:16
 * Author: 3urobeat
 * 
 * Last Modified: 10.01.2022 13:37:51
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2022 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


const Discord = require('discord.js'); //eslint-disable-line

var xpHistory = {}; //store recent xp increments in an object

/**
 * Handles the xp addition and level up messages
 * @param {Discord.Client} bot The Discord client class
 * @param {Function} logger The logger function
 * @param {Discord.Message} message The Discord message class
 * @param {Object} lang The language object for this guild
 * @param {Object} guildsettings All settings of this guild
 */
module.exports.levelUser = (bot, logger, message, lang, guildsettings) => {

    //only increment messages count if level system has been disabled or if last xp gain is more recent than 30 secs
    if (!guildsettings.levelsystem || (xpHistory[message.guild.id] && xpHistory[message.guild.id][message.author.id] && xpHistory[message.guild.id][message.author.id] + 30000 >= Date.now())) {
        //logger("debug", "levelUser.js", `Only incrementing messages: Level system disabled or XP addition for ${message.author.id} in guild ${message.guild.id} more recent than 30 secs`);

        //increment xp and messages amount for entry that matches this user's id and this guild id
        bot.levelsdb.update({ $and: [{ userid: message.author.id }, { guildid: message.guild.id }] }, 
                            { $inc: { messages: 1 }, $set: { userid: message.author.id, guildid: message.guild.id } }, 
                            { upsert: true }, 
                            (err) => {
                                
            if (err) logger("error", "levelUser.js", `Error updating db of guild ${message.guild.id}. Error: ${err}`) 

        })
        
    } else {

        //random xp amount between 15 and 25 xp
        var xpAmount = Math.floor(Math.random() * (25 - 15 + 1) + 15);

        //log debug message
        //logger("debug", "levelUser.js", `Adding ${xpAmount}xp to user ${message.author.id} in guild ${message.guild.id}`)

        //increment xp and messages amount for entry that matches this user's id and this guild id
        bot.levelsdb.update({ $and: [{ userid: message.author.id }, { guildid: message.guild.id }] }, 
                            { $inc: { xp: xpAmount, messages: 1 }, $set: { userid: message.author.id, guildid: message.guild.id } }, 
                            { upsert: true, returnUpdatedDocs: true }, 
                            (err, numAffected, doc) => {
                                
            if (err) logger("error", "levelUser.js", `Error updating db of guild ${message.guild.id}. Error: ${err}`) 

            //add this action to the xpHistory obj (first check if entry for this guild and user exists, if not then create it)
            if (!xpHistory[message.guild.id]) xpHistory[message.guild.id] = {}
            if (!xpHistory[message.guild.id][message.author.id]) xpHistory[message.guild.id][message.author.id] = 0;

            xpHistory[message.guild.id][message.author.id] = Date.now();

            //send level up message if user reached new level
            if (Math.floor(this.xpToLevel(doc.xp)) > Math.floor(this.xpToLevel(doc.xp - xpAmount))) {
                message.channel.send(lang.general.levelupmsg.replace("username", message.author.username).replace("leveltext", Math.floor(this.xpToLevel(doc.xp))))
            }
        })
    }
}


/**
 * Takes user xp and returns their level
 * @param {Number} xp The current total XP
 * @returns {Number} Current level
 */
module.exports.xpToLevel = (xp) => {

    //Use two different functions from level 0-47 and 48-100
    if (xp <= 226305) return 0.2869 * Math.pow(xp, 0.415); //lvl 47 and lower
        else return 0.2869 * Math.pow(xp, 0.402) + 7;
    
    //My friend and I spent a solid hour trying to balance the XP level calculation to match Mee6's table as closely as possible but just ended up using two functions: https://github.com/Mee6/Mee6-documentation/blob/master/docs/levels_xp.md
}


/**
 * Takes user level and returns their total xp
 * @param {Number} level The level
 * @returns {Number} Current total xp
 */
 module.exports.levelToXp = (level) => {

    //Use two different functions from level 0-47 and 48-100
    if (level <= 47) return 20.2616 * Math.pow(level, 2.40964); //lvl 47 and lower
        else return 22.3321 * Math.pow(level - 7, 2.48756);
}