/*
 * File: rank.js
 * Project: beepbot
 * Created Date: 2022-01-09 17:43:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-12 16:27:58
 * Modified By: 3urobeat
 *
 * Copyright (c) 2022 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js"); // eslint-disable-line

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The rank command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => {

    // Get avatar of targeted user
    let targetuser = bot.getUserFromMsg(message, args, 0, null, true);
    if (!targetuser) return message.channel.send(lang.general.usernotfound);
    if (typeof (targetuser) == "number") return message.channel.send(lang.general.multipleusersfound.replace("useramount", targetuser));


    bot.data.levelsdb.findOne({ $and: [{ userid: targetuser.id }, { guildid: message.guild.id }] }, (err, doc) => {
        if (err) {
            message.channel.send("Error trying to find user in database: " + err);
            logger("error", "rank.js", "Error trying to find user in database: " + err);
            return;
        }

        // Fake doc if user is not in db
        if (!doc) {
            doc = {};
            doc["xp"] = 0;
            doc["messages"] = 0;
        }

        // Create message template
        let msg = {
            embeds: [{
                title: lang.cmd.othermisc.ranktitle.replace("username", `@${targetuser.displayName}`),
                color: bot.misc.randomHex(),
                thumbnail: { url: targetuser.displayAvatarURL() },
                description: "",
                fields: [{
                    name: lang.cmd.othermisc.ranklevel,
                    value: String(Math.floor(bot.data.xpToLevel(doc.xp))),
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
                    value: String(Math.floor(bot.data.levelToXp(Math.floor(bot.data.xpToLevel(doc.xp)) + 1) - doc.xp)) + " XP"
                }]
            }
            ]};

        // Display warning message if level system is currently disabled
        if (!guildsettings.levelsystem) msg.embeds[0].description = lang.cmd.othermisc.ranklevelsystemdisabled;

        message.channel.send(msg);
    });
};

module.exports.info = {
    names: ["rank", "level"],
    description: "cmd.othermisc.rankinfodescription",
    usage: "[mention/username/userid]",
    options: [ // Note: Edit embed footer in ranks.js as well if the usage changes!
        {
            name: "user",
            description: "Get the rank of a specific user",
            required: false,
            type: Discord.ApplicationCommandOptionType.User
        }
    ],
    accessableby: ["all"],
    allowedindm: false,
    nsfwonly: false
};
