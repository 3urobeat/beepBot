/*
 * File: levelReset.js
 * Project: beepbot
 * Created Date: 2023-03-13 19:03:48
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-11 19:52:04
 * Modified By: 3urobeat
 *
 * Copyright (c) 2023 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js"); // eslint-disable-line

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The levelReset command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    let lf = lang.cmd.othergeneral;

    // Check if user wants to reset data of a specific user or of everyone
    if (args[0]) {

        // Attempt to find a specific user in the message
        let resetUser = bot.getUserFromMsg(message, args, 0, null, true);
        if (!resetUser) return message.channel.send(lf.levelResetusernotfound);
        if (typeof (avataruser) == "number") return message.channel.send(lang.general.multipleusersfound.replace("useramount", resetUser));

        // Ask for confirmation
        message.channel.send(lf.levelResetuserconfirm.replace("username", `@${resetUser.displayName}`).replace("userid", resetUser.id));

        // Define message collector and set timeout to 15 sec
        const filter    = (m) => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, time: 15000 });

        collector.on("collect", (msg) => {
            if (message.author.id !== msg.author.id) return; // Only the original author is allowed to answer

            if (msg.content == "y") {

                // Reset the xp and messages value of resetUser
                bot.data.levelsdb.update({ $and: [{ userid: resetUser.id }, { guildid: message.guild.id }] }, { $set: { xp: 0, messages: 0 } }, {}, (err, numAffected) => {
                    if (err) logger("error", "levelReset.js", `Error updating db of guild ${message.guild.id}. Error: ${err}`);

                    // Respond with error or finished message
                    if (numAffected < 1) message.channel.send(lf.levelResetusernotfound);
                        else message.channel.send(lf.levelResetfinished.replace("useramount", numAffected));
                });

            } else {
                message.channel.send(lf.levelResetaborted);
            }

            collector.stop();
        });

    } else { // User did not provide an id so initiate a reset for every user

        // Ask for confirmation
        message.channel.send(lf.levelResetconfirm);

        // Define message collector and set timeout to 15 sec
        const filter    = (m) => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, time: 15000 });

        collector.on("collect", (msg) => {
            if (message.author.id !== msg.author.id) return; // Only the original author is allowed to answer

            if (msg.content == "y") {

                // Reset the xp and messages value of every user in this guild
                bot.data.levelsdb.update({ guildid: msg.guild.id }, { $set: { xp: 0, messages: 0 } }, { multi: true }, (err, numAffected) => {
                    if (err) logger("error", "levelReset.js", `Error updating db of guild ${message.guild.id}. Error: ${err}`);

                    // Respond with finished message including the amount of affected rows
                    message.channel.send(lf.levelResetfinished.replace("useramount", numAffected));
                });

            } else {
                message.channel.send(lf.levelResetaborted);
            }

            collector.stop();
        });

    }

};

module.exports.info = {
    names: ["levelreset"],
    description: "cmd.othergeneral.levelResetinfodescription",
    usage: "[mention/username/userid]",
    options: [
        {
            name: "user",
            description: "Resets the XP, level and message count of this specific user instead of everyone",
            required: false,
            type: Discord.ApplicationCommandOptionType.User
        }
    ],
    accessableby: ["admins"],
    allowedindm: false,
    nsfwonly: false
};
