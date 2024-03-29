/*
 * File: ban.js
 * Project: beepbot
 * Created Date: 2020-12-31 17:05:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 11:54:19
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
 * The broadcast command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line

    let banuser = bot.getUserFromMsg(message, args, 0, null, false, ["-r", "-t", "-n"]);
    if (!banuser) return message.channel.send(lang.general.usernotfound);
    if (typeof (banuser) == "number") return message.channel.send(lang.general.multipleusersfound.replace("useramount", banuser));

    if (message.guild.fetchOwner() && message.guild.fetchOwner().id !== message.author.id && message.guild.members.cache.get(banuser.id).roles.highest.position >= message.member.roles.highest.position) {
        return message.channel.send(lang.cmd.ban.highestRoleError);
    }

    if (banuser.id == bot.client.user.id) return message.channel.send(bot.misc.randomString(lang.cmd.ban.botban));
    if (banuser.id == message.author.id) return message.channel.send(lang.cmd.ban.selfban);

    if (message.guild.members.cache.get(banuser.id).roles.highest.position >= message.guild.members.cache.get(bot.client.user.id).roles.highest.position) {
        return message.channel.send(lang.cmd.ban.botRoleTooLow);
    }

    // Get reason if there is one provided
    let banreason, banreasontext = "";

    bot.getReasonFromMsg(args, ["-time", "-t", "-notify", "-n", undefined], (reason, reasontext) => {
        banreason = reason;
        banreasontext = reasontext;
    });

    // Checks user perms and ban
    if (message.member.permissions.has(Discord.PermissionFlagsBits.BanMembers, Discord.PermissionFlagsBits.Administrator)) {
        message.guild.members.cache.get(banuser.id).ban({ reason: banreason }).then(() => {
            let notifytimetext = lang.cmd.ban.permanent; // If not permanent it will get changed by the time argument code block

            // Time Argument
            if (args.includes("-time") || args.includes("-t")) {
                bot.misc.getTimeFromMsg(args, (timeinms, unitindex, arrcb) => { // The 3 arguments inside brackets are arguments from the callback
                    if (!timeinms) return message.channel.send(lang.general.unsupportedtime.replace("timeargument", arrcb[1]));

                    let timedbansobj = {
                        userid: banuser.id,
                        until: Date.now() + timeinms,
                        guildid: message.guild.id,
                        authorid: message.author.id,
                        banreason: banreasontext
                    };

                    notifytimetext = `${arrcb[0]} ${lang.general.gettimefuncoptions[unitindex]}`; // Change permanent to timetext

                    bot.data.timedbans.remove({$and: [{ userid: banuser.id }, { guildid: message.guild.id }] }, (err) => { if (err) logger("error", "ban.js", `error removing user ${banuser.id}: ${err}`); }); // Remove an old entry if there should be one
                    bot.data.timedbans.insert(timedbansobj, (err) => { if (err) logger("error", "ban.js", "error inserting user: " + err); });
                    message.channel.send(lang.cmd.ban.tempbanmsg.replace("username", banuser.displayName).replace("timetext", notifytimetext).replace("banreasontext", banreasontext));
                    message.react("✅").catch(() => {}); // Catch but ignore error

                    bot.msgToModlogChannel(message.guild, "ban", message.author, banuser, [banreasontext, notifytimetext, args.includes("-notify") || args.includes("-n")]); // Details[2] results in boolean
                });
            } else {
                message.channel.send(lang.cmd.ban.permbanmsg.replace("username", banuser.displayName).replace("banreasontext", banreasontext));
                message.react("✅").catch(() => {}); // Catch but ignore error

                bot.msgToModlogChannel(message.guild, "ban", message.author, banuser, [banreasontext, lang.cmd.ban.permanent, args.includes("-notify") || args.includes("-n")]); // Details[2] results in boolean
            }

            // Notify argument
            if (args.includes("-notify") || args.includes("-n")) {
                if (!banuser.bot) banuser.send(lang.cmd.ban.bannotifymsg.replace("servername", message.guild.name).replace("banreasontext", banreasontext).replace("timetext", notifytimetext)).catch(err => {
                    message.channel.send(lang.general.dmerror + err);
                });
            }

        }).catch(err => {
            message.channel.send(`${lang.general.anerroroccurred} ${err}`);
            message.react("❌").catch(() => {}); // Catch but ignore error
        });
    } else {
        message.channel.send(bot.misc.usermissperm(lang));
        message.react("❌").catch(() => {}); // Catch but ignore error
    }

};

module.exports.info = {
    names: ["ban"],
    description: "cmd.ban.infodescription",
    usage: '(mention/username) [-r reason] [-time/-t Number "seconds"/"minutes"/"hours"/"days"/"months"/"years"] [-notify/-n]',
    options: [
        {
            name: "user",
            description: "The user to ban",
            required: true,
            type: Discord.ApplicationCommandOptionType.User
        },
        {
            name: "reason",
            description: "The reason of the ban",
            required: false,
            type: Discord.ApplicationCommandOptionType.String,
            prefix: "-r"
        },
        {
            name: "time",
            description: "Provide a duration and timeframe to only temporary ban the user",
            required: false,
            type: Discord.ApplicationCommandOptionType.Number,
            prefix: "-t"
        },
        {
            name: "timeframe",          // I still don't like this separation of these two values but couldn't find a better way as of now
            description: "Timeframe",
            required: false,
            type: Discord.ApplicationCommandOptionType.String,
            choices: [
                { name: "Seconds", value: "seconds" },
                { name: "Minutes", value: "minutes" },
                { name: "Hours", value: "hours" },
                { name: "Days", value: "days" },
                { name: "Months", value: "months" },
                { name: "Years", value: "years" }
            ]
        },
        {
            name: "notify",
            description: "If the user should be notified of the ban and reason",
            required: false,
            type: Discord.ApplicationCommandOptionType.Boolean,
            prefix: "-n"
        }
    ],
    accessableby: ["admins"],
    allowedindm: false,
    nsfwonly: false
};
