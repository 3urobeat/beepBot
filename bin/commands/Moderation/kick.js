/*
 * File: kick.js
 * Project: beepbot
 * Created Date: 2020-12-13 17:41:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 11:54:23
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
 * The kick command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line

    let kickuser = bot.getUserFromMsg(message, args, 0, null, false, ["-r", "-t", "-n"]);
    if (!kickuser) return message.channel.send(lang.general.usernotfound);
    if (typeof (kickuser) == "number") return message.channel.send(lang.general.multipleusersfound.replace("useramount", kickuser));

    let guildowner = await message.guild.fetchOwner();

    if (guildowner && guildowner.user.id !== message.author.id && message.guild.members.cache.get(kickuser.id).roles.highest.position >= message.member.roles.highest.position) {
        message.channel.send(lang.cmd.kick.highestRoleError);
        message.react("❌").catch(() => {}); // Catch but ignore error
        return;
    }

    if (kickuser.id == bot.client.user.id) return message.channel.send(bot.misc.randomstring(lang.cmd.kick.botkick));
    if (kickuser.id == message.author.id) return message.channel.send(lang.cmd.kick.selfkick);

    if (message.guild.members.cache.get(kickuser.id).roles.highest.position >= message.guild.members.cache.get(bot.client.user.id).roles.highest.position) {
        return message.channel.send(lang.cmd.kick.botRoleTooLow);
    }

    // Get reason if there is one provided
    let kickreason, kickreasontext = "";

    bot.getReasonFromMsg(args, ["-time", "-t", "-notify", "-n", undefined], (reason, reasontext) => {
        kickreason = reason;
        kickreasontext = reasontext;
    });

    // Checks user perms and kick
    if (message.member.permissions.has(Discord.PermissionFlagsBits.KickMembers, Discord.PermissionFlagsBits.Administrator)) {
        message.guild.members.cache.get(kickuser.id).kick(kickreason).then(() => {
            message.channel.send(lang.cmd.kick.kickmsg.replace("username", kickuser.displayName).replace("kickreasontext", kickreasontext));
            message.react("✅").catch(() => {}); // Catch but ignore error

            bot.msgToModlogChannel(message.guild, "kick", message.author, kickuser, [kickreasontext, args.includes("-notify") || args.includes("-n")]); // Details[1] results in boolean

            if (args.includes("-notify") || args.includes("-n")) {
                if (!kickuser.bot) kickuser.send(lang.cmd.kick.kicknotifymsg.replace("servername", message.guild.name).replace("kickreasontext", kickreasontext)).catch(err => {
                    message.channel.send(lang.general.dmerr + err);
                });
            }
        }).catch(err => {
            message.channel.send(`${lang.general.anerroroccurred} ${err}`);
            message.react("❌").catch(() => {}); // Catch but ignore error
        });
    } else {
        message.channel.send(bot.misc.usermissperm(lang));
    }
};

module.exports.info = {
    names: ["kick"],
    description: "cmd.kick.infodescription",
    usage: "(mention/username) [-r reason] [-notify/-n]",
    options: [
        {
            name: "user",
            description: "The user to kick",
            required: true,
            type: Discord.ApplicationCommandOptionType.User
        },
        {
            name: "reason",
            description: "The reason of the kick",
            required: false,
            type: Discord.ApplicationCommandOptionType.String,
            prefix: "-r"
        },
        {
            name: "notify",
            description: "If the user should be notified of the kick and reason",
            required: false,
            type: Discord.ApplicationCommandOptionType.Boolean,
            prefix: "-n"
        }
    ],
    accessableby: ["moderators"],
    allowedindm: false,
    nsfwonly: false
};
