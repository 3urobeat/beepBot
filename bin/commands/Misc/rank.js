/*
 * File: rank.js
 * Project: beepbot
 * Created Date: 09.01.2022 17:43:00
 * Author: 3urobeat
 * 
 * Last Modified: 09.01.2022 20:11:17
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2022 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


const Discord = require('discord.js'); //eslint-disable-line

/**
 * The command template
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The recieved message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {

    var levelUser = require("../../functions/levelUser");
    
    //Get avatar of targeted user
    var targetuser = fn.getuserfrommsg(message, args, 0, null, true);
    if (!targetuser) return message.channel.send(lang.general.usernotfound)
    if (typeof (targetuser) == "number") return message.channel.send(lang.general.multipleusersfound.replace("useramount", targetuser))
    

    bot.levelsdb.findOne({ $and: [{ userid: targetuser.id }, { guildid: message.guild.id }] }, (err, doc) => {
        if (err) {
            message.channel.send("Error trying to find user in database: " + err)
            logger("error", "rank.js", "Error trying to find user in database: " + err)
            return;
        }

        //Fake doc if user is not in db
        if (!doc) {
            doc = {}
            doc["xp"] = 0;
            doc["messages"] = 0;
        }

        message.channel.send({
            embeds: [{
                title: lang.cmd.othermisc.ranktitle.replace("username", `${targetuser.username}#${targetuser.discriminator}`),
                color: fn.randomhex(),
                thumbnail: { url: targetuser.displayAvatarURL() },
                fields: [{
                    name: lang.cmd.othermisc.ranklevel,
                    value: String(Math.floor(levelUser.xpToLevel(doc.xp))),
                    inline: true
                },
                {
                    name: lang.cmd.othermisc.rankmessagessent,
                    value: String(doc.messages),
                    inline: true
                },
                {
                    name: lang.cmd.othermisc.ranktotalxp,
                    value: doc.xp + " XP"
                },
                {
                    name: lang.cmd.othermisc.rankxpfornextlvl,
                    value: String(Math.floor(levelUser.levelToXp(Math.floor(levelUser.xpToLevel(doc.xp)) + 1) - doc.xp)) + " XP"
                }]
            }
        ]})
    })
}

module.exports.info = {
    names: ["rank", "level"],
    description: "cmd.othermisc.rankinfodescription",
    usage: '[mention/username/userid]',
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false
}