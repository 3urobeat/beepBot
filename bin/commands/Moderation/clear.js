/*
 * File: clear.js
 * Project: beepbot
 * Created Date: 2020-08-07 18:02:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 10:52:47
 * Modified By: 3urobeat
 *
 * Copyright (c) 2020 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js"); // eslint-disable-line

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The clear command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line

    let invalidamount = lang.cmd.othermoderation.clearinvalidamount;
    if (!args[0]) return message.channel.send(invalidamount);

    let messagecount = parseInt(args[0]);
    if (isNaN(messagecount)) return message.channel.send(invalidamount);
    if (messagecount > 100 || messagecount < 1) return message.channel.send(invalidamount);

    if (message.member.permissions.has(Discord.PermissionFlagsBits.ManageMessages, Discord.PermissionFlagsBits.Administrator)) {

        message.channel.messages.fetch({ limit: messagecount + 1 })
            .then((messages) => {
                message.channel.bulkDelete(messages);
            }).catch(err => {
                message.channel.send(`${lang.general.anerroroccurred} ${err}`);
                message.react("❌").catch(() => {}); // Catch but ignore error
                return;
            });

        bot.msgToModlogChannel(message.guild, "clear", message.author, {}, [messagecount, message.channel]);

    } else {
        message.channel.send(bot.misc.usermissperm(lang));
        message.react("❌").catch(() => {}); // Catch but ignore error
    }

};

module.exports.info = {
    names: ["clear", "delete"],
    description: "cmd.othermoderation.clearinfodescription",
    usage: "(amount of messages)",
    options: [
        {
            name: "amount",
            description: "The amount of messages to delete",
            required: true,
            type: Discord.ApplicationCommandOptionType.Number,
            min_value: 1,  // eslint-disable-line camelcase
            max_value: 100 // eslint-disable-line camelcase
        },
    ],
    accessableby: ["moderators"],
    allowedindm: false,
    nsfwonly: false
};
