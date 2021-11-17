/*
 * File: clear.js
 * Project: beepbot
 * Created Date: 07.08.2020 18:02:00
 * Author: 3urobeat
 * 
 * Last Modified: 17.11.2021 19:12:27
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    var Discord = require("discord.js");

    let invalidamount = lang.cmd.othermoderation.clearinvalidamount
    if (!args[0]) return message.channel.send(invalidamount);

    var messagecount = parseInt(args[0]);
    if (isNaN(messagecount)) return message.channel.send(invalidamount);
    if (messagecount > 100 || messagecount < 1) return message.channel.send(invalidamount);

    if (message.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_MESSAGES, Discord.Permissions.FLAGS.ADMINISTRATOR)) {

        message.channel.messages.fetch({ limit: messagecount + 1 })
            .then((messages) => {
                message.channel.bulkDelete(messages)
            }).catch(err => {
                message.channel.send(`${lang.general.anerroroccurred} ${err}`)
                message.react("❌").catch(() => {}) //catch but ignore error
                return;
            })
        
        fn.msgtomodlogchannel(message.guild, "clear", message.author, {}, [messagecount, message.channel])
    } else {
        message.channel.send(fn.usermissperm(lang))
        message.react("❌").catch(() => {}) //catch but ignore error
    }
}

module.exports.info = {
    names: ["clear", "delete"],
    description: "cmd.othermoderation.clearinfodescription",
    usage: "(amount of messages)",
    accessableby: ['moderators'],
    allowedindm: false,
    nsfwonly: false
}