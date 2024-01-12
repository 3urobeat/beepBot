/*
 * File: ranks.js
 * Project: beepbot
 * Created Date: 2022-01-09 20:16:29
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-12 16:21:42
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
 * The ranks command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => {

    bot.data.levelsdb.find({ guildid: message.guild.id }, (err, docs) => {
        if (err) {
            message.channel.send("Error trying to find user in database: " + err);
            logger("error", "rank.js", "Error trying to find user in database: " + err);
            return;
        }

        if (docs.size < 1) return; // Never occurred in my testing but I'm leaving it here just to make sure

        // Create message template
        let msg = {
            embeds: [{
                title: lang.cmd.othermisc.rankstitle.replace("servername", message.guild.name),
                color: bot.misc.randomHex(),
                thumbnail: { url: message.guild.iconURL() },
                description: "",
                fields: [],
                footer: {
                    text: `${lang.cmd.othermisc.rankscheckuser}: ${guildsettings.prefix}rank [mention/username/userid]`
                }
            }
            ]};

        // Display warning message if level system is currently disabled
        if (!guildsettings.levelsystem) msg.embeds[0].description = lang.cmd.othermisc.ranklevelsystemdisabled;

        // Sort array by XP
        docs.sort((a, b) => { return b.xp - a.xp; });

        // Add each element to fields array
        docs.forEach((e, i) => {
            if (i >= 25) return; // Max field amount is 25: https://birdie0.github.io/discord-webhooks-guide/other/field_limits.html

            msg.embeds[0].fields.push({
                name: `${i + 1}. ${e.username}`,
                value: `${lang.cmd.othermisc.ranklevel} ${Math.floor(bot.data.xpToLevel(e.xp))}\n${e.xp} XP\n${e.messages} ${lang.cmd.othermisc.ranksmessages}`
            });
        });

        message.channel.send(msg);
    });

};

module.exports.info = {
    names: ["ranks", "levels"],
    description: "cmd.othermisc.ranksinfodescription",
    usage: "",
    options: [],
    accessableby: ["all"],
    allowedindm: false,
    nsfwonly: false
};
