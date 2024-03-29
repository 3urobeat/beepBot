/*
 * File: info.js
 * Project: beepbot
 * Created Date: 2020-10-07 20:44:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 13:34:51
 * Modified By: 3urobeat
 *
 * Copyright (c) 2020 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js"); // eslint-disable-line
const sysInfo = require("systeminformation");

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The info command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    const lf         = lang.cmd.info;

    let infofields   = [];
    let thumbnailurl = "";
    let whichmember;
    let alluseractivites;
    let usernickname;
    let guildowner;
    let cpuTemp;
    let cpuUsage;


    // Small function to avoid repeating code
    let quickInfoField = (index, name, value, inline) => {
        return infofields[index] = {
            name: lf[name],
            value: String(lf[value]).replace("prefix", guildsettings.prefix),
            inline: inline
        };
    };

    if (!args[0]) args[0] = "";
    if (!args[1]) args[1] = "";
    if (!args[2]) args[2] = "";

    let sendMobile = args[1].toLowerCase() == "mobile" || args[2].toLowerCase() == "mobile"; // Provide mobile option because the other version looks way nicer on Desktop but is completely screwed over on mobile

    switch(args[0].toLowerCase()) {
        case "user":
            // Check if user wants to get info about another user
            if (!args[1] || args[1] == "mobile" || message.channel.type == Discord.ChannelType.DM) {
                whichmember = message.guild.members.cache.get(message.author.id);
            } else {
                whichmember = bot.getUserFromMsg(message, args, 1, 2, true);

                // Check if nothing or multiple results were found
                if (!whichmember) return message.channel.send(lang.general.usernotfound);
                if (typeof (whichmember) == "number") return message.channel.send(lang.general.multipleusersfound.replace("useramount", whichmember));

                // Get GuildMember from User again to access presence etc. below
                whichmember = message.guild.members.cache.get(whichmember.id);
            }

            thumbnailurl = whichmember.user.displayAvatarURL();
            alluseractivites = "";
            usernickname = "";

            if (whichmember.presence) {
                whichmember.presence.activities.forEach((e, i) => {
                    if (i == 0) alluseractivites += `${e.name}`;
                        else alluseractivites += `, ${e.name}`;

                    if (i + 1 == Object.keys(whichmember.presence.activities).length && alluseractivites.length >= 25) {
                        alluseractivites = alluseractivites.slice(0, 25) + "...";
                    }
                });
            }

            if (message.channel.type == Discord.ChannelType.DM || whichmember.nickname == null) usernickname = "/";
                else usernickname = whichmember.nickname;

            if (sendMobile) {
                // Mobile version
                infofields[0] = {
                    name: lf.user,
                    value: `**${lf.username}:** @${whichmember.user.displayName}\n` +
                           `**${lf.nickname}:** ${usernickname}\n` +
                           `**${lf.status}:** ${whichmember.presence ? whichmember.presence.status : "?"}\n` +
                           `**${lf.games}:** (${whichmember.presence ? Object.keys(whichmember.presence.activities).length : "?"}) ${alluseractivites}\n` +
                           `**${lf.id}:** ${whichmember.id}\n` +
                           `**${lf.creationdate}:** ${(new Date(whichmember.user.createdAt - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, " ").replace(/\..+/, "")}`,
                    inline: true
                };

                quickInfoField(1, "bot", "botshowmore", false);
                quickInfoField(2, "server", "servershowmore", false);

            } else {
                // Desktop version
                infofields[0] = {
                    name: lf.user,
                    value: `${lf.username}:\n` +
                           `${lf.nickname}:\n` +
                           `${lf.status}:\n` +
                           `${lf.games}: (${whichmember.presence ? Object.keys(whichmember.presence.activities).length : "?"})\n` +
                           `${lf.id}:\n` +
                           `${lf.creationdate}:`,
                    inline: true
                };

                infofields[1] = {
                    name: "\u200b",
                    value: `@${whichmember.user.displayName}\n` +
                           `${usernickname}\n` +
                           `${whichmember.presence ? whichmember.presence.status : "?"}\n` +
                           `${alluseractivites}\n` +
                           `${whichmember.id}\n` +
                           `${(new Date(whichmember.user.createdAt - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, " ").replace(/\..+/, "")}`,
                    inline: true
                };

                infofields[2] = {
                    name: "\u200b",
                    value: "\u200b"
                };

                quickInfoField(3, "bot", "botshowmore", true);
                quickInfoField(4, "server", "servershowmore", true);
            }

            break;

        case "server":
            if (message.channel.type == Discord.ChannelType.DM) return message.channel.send(lf.serverdmerror);

            thumbnailurl = message.guild.iconURL();

            guildowner = await message.guild.fetchOwner();

            if (sendMobile) {
                // Mobile version
                infofields[0] = {
                    name: lf.server,
                    value: `**${lf.name}:** ${message.guild.name}\n` +
                        `**${lf.id}:** ${message.guild.id}\n` +
                        `**${lf.owner}:** <@${guildowner.user.id}>\n` +
                        `**${lf.usercount}:** ${message.guild.members.cache.size}\n` +
                        `**${lf.channelid}:** ${message.channel.id}\n` +
                        `**${lf.shardid}:** ${message.guild.shardId}\n` +
                        `**${lf.creationdate}:** ${(new Date(message.guild.createdAt - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, " ").replace(/\..+/, "")}`,
                    inline: true
                };

                quickInfoField(1, "bot", "botshowmore", false);
                quickInfoField(2, "user", "usershowmore", false);

            } else {

                // Desktop version
                infofields[0] = {
                    name: lf.server,
                    value: `${lf.name}:\n` +
                        `${lf.id}:\n` +
                        `${lf.owner}:\n` +
                        `${lf.usercount}:\n` +
                        `${lf.channelid}:\n` +
                        `${lf.shardid}:\n` +
                        `${lf.creationdate}:`,
                    inline: true
                };

                infofields[1] = {
                    name: "\u200b",
                    value: `${message.guild.name}\n` +
                        `${message.guild.id}\n` +
                        `<@${guildowner.user.id}>\n` +
                        `${message.guild.members.cache.size}\n` +
                        `${message.channel.id}\n` +
                        `${message.guild.shardId}\n` +
                        `${(new Date(message.guild.createdAt - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, " ").replace(/\..+/, "")}`,
                    inline: true
                };

                infofields[2] = {
                    name: "\u200b",
                    value: "\u200b"
                };

                quickInfoField(3, "bot", "botshowmore", true);
                quickInfoField(4, "user", "usershowmore", true);

            }
            break;

        default:
            thumbnailurl = bot.client.user.displayAvatarURL();
            cpuTemp  = await sysInfo.cpuTemperature(async (cb) => { return cb; });
            cpuUsage = await sysInfo.currentLoad(async (cb) => { return cb; });
            if (cpuTemp.main == -1) cpuTemp.main = "/"; // Si can't read temp

            if (sendMobile) {
                // Mobile version
                infofields[0] = {
                    name: `**${lf.bot}** - Mobile`,
                    value: `**${lf.uptime}:** ${bot.misc.round(bot.client.uptime / 3600000, 2)} hours\n` +
                           `**${lf.heartbeat}:** ${bot.misc.round(bot.client.ws.ping, 2)} ms\n` +
                           `**${lf.ramusage}:** ${Math.round(process.memoryUsage()["rss"] / 1024 / 1024 * 100) / 100} MB (RSS)\n` +
                           `**${lf.cputemp}:** ${bot.misc.round(cpuTemp.main, 2)} °C\n` +
                           `**${lf.cpuusage}:** ${bot.misc.round(cpuUsage.currentLoad, 2)} %\n` +
                           `**${lf.nodejsversion}:** ${process.version.replace("v", "")}\n` +
                           `**${lf.discordjsversion}:** v${Discord.version}\n` +
                           `**${lf.servercount}:** ${(await bot.client.shard.fetchClientValues("guilds.cache.size")).reduce((a, b) => b + a)}\n` +
                           `**${lf.shardcount}:** ${bot.client.shard.count}\n` +
                           `**${lf.inviteme}:** [Click here!](${bot.data.constants.botinvitelink})\n`,
                    inline: true
                };

                quickInfoField(1, "user", "usershowmore", false);
                quickInfoField(2, "server", "servershowmore", false);

            } else {

                // Desktop version
                infofields[0] = {
                    name: lf.bot,
                    value: `${lf.uptime}:\n` +
                           `${lf.heartbeat}:\n` +
                           `${lf.ramusage}:\n` +
                           `${lf.cputemp}:\n` +
                           `${lf.cpuusage}:\n` +
                           `${lf.nodejsversion}:\n` +
                           `${lf.discordjsversion}:\n` +
                           `${lf.servercount}:\n` +
                           `${lf.shardcount}:\n` +
                           `${lf.inviteme}:\n`,
                    inline: true
                };

                infofields[1] = {
                    name: "\u200b",
                    value: `${bot.misc.round(bot.client.uptime / 3600000, 2)} hours\n` +
                           `${bot.misc.round(bot.client.ws.ping, 2)} ms\n` +
                           `${Math.round(process.memoryUsage()["rss"] / 1024 / 1024 * 100) / 100} MB (RSS)\n` +
                           `${bot.misc.round(cpuTemp.main, 2)} °C\n` +
                           `${bot.misc.round(cpuUsage.currentLoad, 2)} %\n` +
                           `${process.version}\n` +
                           `v${Discord.version}\n` +
                           `${(await bot.client.shard.fetchClientValues("guilds.cache.size")).reduce((a, b) => b + a)}\n` +
                           `${bot.client.shard.count}\n` +
                           `[Click here!](${bot.data.constants.botinvitelink})`,
                    inline: true
                };

                infofields[2] = {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true
                };

                quickInfoField(3, "user", "usershowmore", true);
                quickInfoField(4, "server", "servershowmore", true);
            }
    }

    message.channel.send({
        embeds: [{
            title: `${bot.data.constants.BOTNAME} - ${lf.info}`,
            color: bot.misc.randomHex(),
            thumbnail: { url: thumbnailurl },
            description: `${bot.data.constants.BOTNAME} version ${bot.data.config.version} made by ${bot.data.constants.BOTOWNER}\n${bot.data.constants.githublink}`,
            fields: infofields,
            footer: {
                icon_url: message.author.displayAvatarURL(), // eslint-disable-line camelcase
                text: `${lang.general.requestedby} @${message.author.displayName} • ${lf.footermobilemsg.replace("prefix", guildsettings.prefix)}`
            }
        }]
    });

};

module.exports.info = {
    names: ["info"],
    description: "cmd.info.infodescription",
    usage: '["bot"/"user"/"server"] ["mobile"]',
    options: [
        {
            name: "mode",
            description: "Select if information should be shown about the bot, user (you) or the server",
            required: false,
            type: Discord.ApplicationCommandOptionType.String,
            choices: [
                { name: "Bot", value: "bot" },
                { name: "User", value: "user" },
                { name: "Server", value: "server" }
            ]
        },
        {
            name: "mobile",
            description: "Set to true to get a response that is readable on mobile devices",
            required: false,
            type: Discord.ApplicationCommandOptionType.Boolean
        }
    ],
    accessableby: ["all"],
    allowedindm: true,
    nsfwonly: false
};
