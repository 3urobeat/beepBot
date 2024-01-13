/*
 * File: settings.js
 * Project: beepbot
 * Created Date: 2020-08-02 22:07:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-12 12:03:24
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
 * The settings command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    let guildid   = message.guild.id;
    let none      = "**/**";
    let lf        = lang.cmd.settings;

    // Helper function that avoids having to copy paste the same msg and makes changing it easier
    let logDbErr = (err) => {
        logger("error", "settings.js", `Error updating db of guild ${guildid}. Error: ${err}`);
    };

    // Try to repair role settings if they should include a null for some reason to prevent error
    guildsettings.adminroles     = guildsettings.adminroles.filter((e) => { return e !== null; });
    guildsettings.moderatorroles = guildsettings.moderatorroles.filter((e) => { return e !== null; });
    guildsettings.memberaddroles = guildsettings.memberaddroles.filter((e) => { return e !== null; });


    /* --------------- Read settings for this guild --------------- */

    // adminroles, moderatorroles & memberaddroles
    let adminroles = none;
    let moderatorroles = none;
    let memberaddroles = none;

    if (guildsettings.adminroles && guildsettings.adminroles.length > 0) {
        adminroles = "";

        for(let i = 0; i < guildsettings.adminroles.length; i++) { // < and not <= because i is one lower than length
            if (i < 1) adminroles += `<@&${message.guild.roles.cache.get(guildsettings.adminroles[i]).id}>`;
                else adminroles += `, <@&${message.guild.roles.cache.get(guildsettings.adminroles[i]).id}>`;
        }
    }

    if (guildsettings.moderatorroles && guildsettings.moderatorroles.length > 0) {
        moderatorroles = "";

        for(let i = 0; i < guildsettings.moderatorroles.length; i++) { // < and not <= because i is one lower than length
            if (i < 1) moderatorroles += `<@&${message.guild.roles.cache.get(guildsettings.moderatorroles[i]).id}>`;
                else moderatorroles += `, <@&${message.guild.roles.cache.get(guildsettings.moderatorroles[i]).id}>`;
        }
    }

    if (guildsettings.memberaddroles && guildsettings.memberaddroles.length > 0) {
        memberaddroles = "";

        for(let i = 0; i < guildsettings.memberaddroles.length; i++) { // < and not <= because i is one lower than length
            if (i < 1) memberaddroles += `<@&${message.guild.roles.cache.get(guildsettings.memberaddroles[i]).id}>`;
                else memberaddroles += `, <@&${message.guild.roles.cache.get(guildsettings.memberaddroles[i]).id}>`;
        }
    }


    // Systemchannel
    let systemchannel = none;

    if (guildsettings.systemchannel) { // Channel set
        systemchannel = message.guild.channels.cache.get(guildsettings.systemchannel);

        if (!systemchannel) { // Check if channel doesn't exist
            bot.data.settings.update({ guildid: guildid }, { $set: { systemchannel: bot.data.constants.defaultguildsettings.systemchannel }}, {}, (err) => { if (err) logDbErr(err); }); // Reset setting
            systemchannel = none;
        } else {
            systemchannel = `<#${systemchannel.id}>`;
        }
    } else { // No channel set
        if (message.guild.systemChannel !== null) { // Display recommendation
            systemchannel = `${none} - ${lf.recommendation}: \`#${message.guild.systemChannel.name}\``;
        }
    }


    // Modlogchannel
    let modlogchannel = none;

    if (guildsettings.modlogchannel) { // Channel set
        modlogchannel = message.guild.channels.cache.get(guildsettings.modlogchannel); // Try to get channel

        if (!modlogchannel) { // Check if channel doesn't exist
            bot.data.settings.update({ guildid: guildid }, { $set: { modlogchannel: bot.data.constants.defaultguildsettings.modlogchannel }}, {}, (err) => { if (err) logDbErr(err); }); // Reset setting
            modlogchannel = none;
        } else {
            modlogchannel = `<#${modlogchannel.id}>`;
        }
    }


    // Modlogfeatures
    let modlogfeatures = none;

    if (guildsettings.modlogchannel && guildsettings.modlogfeatures && guildsettings.modlogfeatures.length > 0) { // Also show none if modlogchannel is not set
        modlogfeatures = "";

        for(let i = 0; i < guildsettings.modlogfeatures.length; i++) { // < and not <= because i is one lower than length
            if (i < 1) modlogfeatures += guildsettings.modlogfeatures[i];
                else modlogfeatures += `, ${guildsettings.modlogfeatures[i]}`;
        }
    }


    // Greetmsg & byemsg
    let greetmsg = none;
    let byemsg = none;

    if (guildsettings.greetmsg) greetmsg = guildsettings.greetmsg;
    if (guildsettings.byemsg)   byemsg = guildsettings.byemsg;

    // XP/Level System
    let levelsystemstatus = "❌";

    if (guildsettings.levelsystem) levelsystemstatus = "✅";

    // NSFW
    let allownsfwstatus = "❌";

    if (guildsettings.allownsfw) allownsfwstatus = "✅";


    /* --------------- Code to customize settings --------------- */
    let getRoleID = () => {
        try { // Get and set roleID once to make code cleaner
            if (!args[2]) return message.channel.send(lf.adminmodmemberaddroleusage);

            args[2] = args[2].replace("<@&", "").replace(">", ""); // Replace <@& to make arg a roleID if it should be a mention

            if (args[2].length === 18 && /^\d+$/.test(args[2])) { // Check if the arg is 18 chars long and if it is a number to determine if it is the roleID itself
                return args[2].toString();
            } else {
                return message.guild.roles.cache.find(role => role.name.toLowerCase() === args.slice(2).join(" ").toLowerCase()).id; // Not a roleID so try and find by name
            }
        } catch (err) {
            message.channel.send(`${lf.roleerror}.\n||\`${err}\`||`);
            return;
        }
    };

    if (!args[0]) args[0] = "";

    const filter    = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ filter, time: 10000 });

    let roleID;
    let PREFIX;
    let nickname;
    let channelid;
    let embeddescription;

    switch(args[0].toLowerCase()) {
        case "-h":
        case "-help":
        case "h":
        case "help":
            PREFIX = guildsettings.prefix;

            // \` is to apply markdown to message without terminating the string
            message.channel.send({ embeds: [{
                title: `${lf.settings} - ${lang.cmd.help.help}`,
                fields: [{
                    name: `\`${PREFIX}settings prefix (new prefix)\``,
                    value: lf.helpprefixset },
                {
                    name: `\`${PREFIX}settings lang [${lang.general.language}]\``,
                    value: lf.helplangset },
                {
                    name: `\`${PREFIX}settings adminroles [add/remove/removeall] [${lf.rolename}/${lf.roleID}]\``,
                    value: lf.helpadminrolesset },
                {
                    name: `\`${PREFIX}settings modroles [add/remove/removeall] [${lf.rolename}/${lf.roleID}]\``,
                    value: lf.helpmodrolesset },
                {
                    name: `\`${PREFIX}settings systemchannel [set/remove] [${lf.channelname}/${lf.channelid}]\``,
                    value: lf.helpsystemchannelset },
                {
                    name: `\`${PREFIX}settings modlogchannel [set/remove] [${lf.channelname}/${lf.channelid}]\``,
                    value: lf.helpmodlogchannelset },
                {
                    name: `\`${PREFIX}settings modlogfeatures [enable/disable/enableall/disableall] [${lf.featurename}]\``,
                    value: lf.helpmodlogfeaturesset },
                {
                    name: `\`${PREFIX}settings greetmsg [set/remove] [${lang.general.message}]\``,
                    value: lf.helpgreetmsgset},
                {
                    name: `\`${PREFIX}settings byemsg [set/remove] [${lang.general.message}]\``,
                    value: lf.helpbyemsgset },
                {
                    name: `\`${PREFIX}settings joinroles [add/remove/removeall] [${lf.rolename}/${lf.roleID}]\``,
                    value: lf.helpjoinrolesset },
                {
                    name: `\`${PREFIX}settings levelsystem [enable/disable]\``,
                    value: lf.helplevelsystemset },
                {
                    name: `\`${PREFIX}settings allownsfw [enable/disable]\``,
                    value: lf.helpallownsfwset },
                {
                    name: `\`${PREFIX}settings reset\``,
                    value: lf.helpsettingsreset },
                {
                    name: "** **",
                    value: lf.helpadvice.replace("prefix", PREFIX)
                }]
            }]
            });

            break;
        case "prefix":
            if (!args[1]) args[1] = "";

            nickname = bot.client.user.username;

            if (message.guild.members.cache.get(bot.client.user.id).nickname) {
                nickname = message.guild.members.cache.get(bot.client.user.id).nickname.replace(` [${guildsettings.prefix}]`, "");
            }


            switch(args[1].toLowerCase()) {
                case "set":
                    if (!args[2] || args[2].length < 1) return message.channel.send(lf.prefixmissingargs);

                    bot.data.settings.update({ guildid: guildid }, { $set: { prefix: args[2] }}, {}, (err) => { if (err) logDbErr(err); });
                    message.guild.members.cache.get(bot.client.user.id).setNickname(`${nickname} [${args[2]}]`).catch(err => { message.channel.send("I couldn't add my new Prefix to my nickname. Tip: You can also mention me instead of using a prefix if you should forget it.\nError: " + err); });
                    message.channel.send(`${lf.newprefixset}: ${args[2]}`);
                    break;

                case "remove":
                    PREFIX = bot.data.constants.DEFAULTPREFIX;

                    if (bot.data.config.loginmode == "test") PREFIX = bot.data.constants.DEFAULTTESTPREFIX;

                    bot.data.settings.update({ guildid: guildid }, { $set: { prefix: PREFIX }}, {}, (err) => { if (err) logDbErr(err); });
                    message.guild.members.cache.get(bot.client.user.id).setNickname(`${nickname} [${PREFIX}]`).catch(err => { message.channel.send("I couldn't add my new Prefix to my nickname. Tip: You can also mention me instead of using a prefix if you should forget it.\nError: " + err); });
                    message.channel.send(`${lf.newprefixset}: ${PREFIX}`);
                    break;

                default:
                    message.channel.send(lf.prefixmissingargs);
                    return;
            }
            break;

        case "language":
        case "lang":
            if (!args[1]) args[1] = "";

            if (!Object.keys(bot.data.langObj).includes(args[1].toLowerCase())) {
                message.channel.send(`${lf.supportedlang}: \n${Object.keys(bot.data.langObj).join("\n").split(".json").join("") }`);
            } else {
                bot.data.settings.update({ guildid: guildid }, { $set: { lang: args[1].toLowerCase() }}, {}, (err) => { if (err) logDbErr(err); });

                // Modify all createGuild lang reactions in db to not be able to change the guild language anymore by setting enablesettingslangchange to false for *all* createGuildlang documents of that guild
                bot.data.monitorreactions.update({$and: [{type: "createGuildlang"}, {guildid: message.guild.id}] }, { $set: { enablesettingslangchange: false }}, {multi: true}, (err) => { if (err) logDbErr(err); });
                message.channel.send(`${bot.data.langObj[args[1].toLowerCase()].cmd.settings.newlangsaved}.`);
            }
            break;

        case "adminroles":
        case "adminrole":
            if (!args[1]) args[1] = "";

            switch(args[1].toLowerCase()) {
                case "add":
                    roleID = getRoleID();
                    if (guildsettings.adminroles.includes(roleID)) return message.channel.send(lf.rolealreadyadded);

                    bot.data.settings.update({ guildid: guildid }, { $push: { adminroles: roleID }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(`${lf.roleadded}: ${message.guild.roles.cache.get(roleID).name} (${roleID})`);
                    break;

                case "remove":
                    roleID = getRoleID();
                    if (!guildsettings.adminroles.includes(roleID)) return message.channel.send(lf.rolenotincluded);

                    bot.data.settings.update({ guildid: guildid }, { $pull: { adminroles: roleID }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(`${lf.roleremoved}: ${message.guild.roles.cache.get(roleID).name} (${roleID})`);
                    break;

                case "removeall":
                    message.channel.send(lang.general.areyousure);

                    collector.on("collect", msg => {
                        if (message.author.id !== msg.author.id) return; // Only the original author is allowed to answer

                        if (msg.content == "y") {
                            bot.data.settings.update({ guildid: guildid }, { $set: { adminroles: [] }}, {}, (err) => { if (err) logDbErr(err); });
                            message.channel.send(lf.rolearraycleared);
                        }

                        collector.stop();
                    });
                    break;

                default:
                    message.channel.send(lf.adminmodmemberaddroleusage);
                    return;
            }
            break;

        case "moderatorroles":
        case "moderatorrole":
        case "modroles":
        case "modrole":
            if (!args[1]) args[1] = "";

            switch(args[1].toLowerCase()) {
                case "add":
                    roleID = getRoleID();
                    if (guildsettings.moderatorroles.includes(roleID)) return message.channel.send(lf.rolealreadyadded);

                    bot.data.settings.update({ guildid: guildid }, { $push: { moderatorroles: roleID }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(`${lf.roleadded}: ${message.guild.roles.cache.get(roleID).name} (${roleID})`);
                    break;

                case "remove":
                    roleID = getRoleID();
                    if (!guildsettings.moderatorroles.includes(roleID)) return message.channel.send(lf.rolenotincluded);

                    bot.data.settings.update({ guildid: guildid }, { $pull: { moderatorroles: roleID }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(`${lf.roleremoved}: ${message.guild.roles.cache.get(roleID).name} (${roleID})`);
                    break;

                case "removeall":
                    message.channel.send(lang.general.areyousure);
                    collector.on("collect", msg => {
                        if (message.author.id !== msg.author.id) return; // Only the original author is allowed to answer

                        if (msg.content == "y") {
                            bot.data.settings.update({ guildid: guildid }, { $set: { moderatorroles: [] }}, {}, (err) => { if (err) logDbErr(err); });
                            message.channel.send(lf.rolearraycleared);
                        }

                        collector.stop();
                    });
                    break;

                default:
                    message.channel.send(lf.adminmodmemberaddroleusage);
                    return;
            }
            break;

        case "systemchannel":
            if (!args[1]) args[1] = "";

            switch(args[1].toLowerCase()) {
                case "set":
                    try {
                        if (!args[2]) return message.channel.send(lf.systemchannelusage);

                        if (args[2].length === 18 && /^\d+$/.test(args[2])) { // Check if the arg is 18 chars long and if it is a number
                            channelid = args[2].toString();
                        } else if (args[2].match(/(?<=<#)[0-9]{18}?(?=>)/g)) { // <#18numbers>
                            channelid = args[2].toString().replace(/[<#>]/g, "");
                        } else {
                            channelid = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args[2].toLowerCase()).id; // Not a channelid so try and find by name (channelnames can't have spaces so no need to join array)
                        }
                    } catch (err) {
                        return message.channel.send(`${lf.channelerror}.\n||\`${err}\`||`);
                    }

                    // Check if the bot has permissions to send messages to that channel
                    if (!message.guild.channels.cache.get(channelid).permissionsFor(bot.client.user).has(Discord.PermissionFlagsBits.SendMessages)) return message.channel.send(lf.channelnoperm);

                    bot.data.settings.update({ guildid: guildid }, { $set: { systemchannel: channelid }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(`${lf.channelset}: ${message.guild.channels.cache.get(channelid).name} (${channelid})`);
                    break;

                case "remove":
                    bot.data.settings.update({ guildid: guildid }, { $set: { systemchannel: null }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(lf.channelremoved);
                    break;

                default:
                    message.channel.send(lf.systemchannelusage);
                    return;
            }
            break;

        case "modlogchannel":
            if (!args[1]) args[1] = "";

            switch(args[1].toLowerCase()) {
                case "set":
                    try {
                        if (!args[2]) return message.channel.send(lf.modlogchannelusage);

                        if (args[2].length === 18 && /^\d+$/.test(args[2])) { // Check if the arg is 18 chars long and if it is a number
                            channelid = args[2].toString();
                        } else if (args[2].match(/(?<=<#)[0-9]{18}?(?=>)/g)) { // <#18numbers>
                            channelid = args[2].toString().replace(/[<#>]/g, "");
                        } else {
                            channelid = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args[2].toLowerCase()).id; // Not a channelid so try and find by name (channelnames can't have spaces so no need to join array)
                        }
                    } catch (err) {
                        return message.channel.send(`${lf.channelerror}.\n||\`${err}\`||`);
                    }

                    // Check if the bot has permissions to send messages to that channel
                    if (!message.guild.channels.cache.get(channelid).permissionsFor(bot.client.user).has(Discord.PermissionFlagsBits.SendMessages)) return message.channel.send(lf.channelnoperm);

                    bot.data.settings.update({ guildid: guildid }, { $set: { modlogchannel: channelid }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(`${lf.channelset}: ${message.guild.channels.cache.get(channelid).name} (${channelid})`);
                    break;

                case "remove":
                    bot.data.settings.update({ guildid: guildid }, { $set: { modlogchannel: null }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(lf.channelremoved);
                    break;

                default:
                    message.channel.send(lf.modlogchannelusage);
                    return;
            }
            break;

        case "modlogfeatures":
            if (!args[1]) args[1] = "";

            switch(args[1].toLowerCase()) {
                case "enable":
                    if (!bot.data.constants.defaultguildsettings.modlogfeatures.includes(args[2])) return message.channel.send(`${lf.featurenotfound}\`${bot.data.constants.defaultguildsettings.modlogfeatures.join(", ")}\``);

                    bot.data.settings.update({ guildid: guildid }, { $push: { modlogfeatures: args[2] }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(`${lf.featureenabled}${args[2]}`);
                    break;

                case "disable":
                    if (!bot.data.constants.defaultguildsettings.modlogfeatures.includes(args[2])) return message.channel.send(`${lf.featurenotfound}\`${bot.data.constants.defaultguildsettings.modlogfeatures.join(", ")}\``);

                    bot.data.settings.update({ guildid: guildid }, { $pull: { modlogfeatures: args[2] }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(`${lf.featuredisabled}${args[2]}`);
                    break;

                case "enableall":
                    bot.data.settings.update({ guildid: guildid }, { $set: { modlogfeatures: bot.data.constants.defaultguildsettings.modlogfeatures }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(lf.featuresallenabled);
                    break;

                case "disableall":
                    bot.data.settings.update({ guildid: guildid }, { $set: { modlogfeatures: [] }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(lf.featuresalldisabled);
                    break;

                default:
                    message.channel.send(`${lf.modlogfeatureusage}\`${bot.data.constants.defaultguildsettings.modlogfeatures.join(", ")}\``);
                    return;
            }
            break;

        case "greetmessage":
        case "greetmsg":
            if (!guildsettings.systemchannel) return message.channel.send(lf.greetmsgsystemchannelnotset);

            if (!args[1]) args[1] = "";

            switch(args[1].toLowerCase()) {
                case "set":
                    if (!args[2]) return message.channel.send(lf.greetmsgusage);
                    if (message.content.length > 150) return message.channel.send(lf.argtoolong);

                    args.splice(0, 2); // Remove "greetmsg" and "set" from array

                    bot.data.settings.update({ guildid: guildid }, { $set: { greetmsg: String(args.join(" ")) }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(lf.msgset);
                    break;

                case "remove":
                    bot.data.settings.update({ guildid: guildid }, { $set: { greetmsg: null }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(lf.msgremoved);
                    break;

                default:
                    message.channel.send(lf.greetmsgusage);
                    return;
            }
            break;

        case "byemessage":
        case "byemsg":
            if (!guildsettings.systemchannel) return message.channel.send(lf.greetmsgsystemchannelnotset);

            if (!args[1]) args[1] = "";

            switch(args[1].toLowerCase()) {
                case "set":
                    if (!args[2]) return message.channel.send(lf.byemsgusage);
                    if (message.content.length > 150) return message.channel.send(lf.argtoolong);

                    args.splice(0, 2); // Remove "byemsg" and "set" from array

                    bot.data.settings.update({ guildid: guildid }, { $set: { byemsg: String(args.join(" ")) }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(lf.msgset);
                    break;

                case "remove":
                    bot.data.settings.update({ guildid: guildid }, { $set: { byemsg: null }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(lf.msgremoved);
                    break;

                default:
                    message.channel.send(lf.byemsgusage);
                    return;
            }
            break;

        case "memberaddroles":
        case "joinroles":
            if (!args[1]) args[1] = "";

            switch(args[1].toLowerCase()) {
                case "add":
                    roleID = getRoleID();
                    if (guildsettings.memberaddroles.includes(roleID)) return message.channel.send(lf.rolealreadyadded);

                    bot.data.settings.update({ guildid: guildid }, { $push: { memberaddroles: roleID }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(`${lf.roleadded}: ${message.guild.roles.cache.get(roleID).name} (${roleID})`);
                    break;

                case "remove":
                    roleID = getRoleID();
                    if (!guildsettings.memberaddroles.includes(roleID)) return message.channel.send(lf.rolenotincluded);

                    bot.data.settings.update({ guildid: guildid }, { $pull: { memberaddroles: roleID }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(`${lf.roleremoved}: ${message.guild.roles.cache.get(roleID).name} (${roleID})`);
                    break;

                case "removeall":
                    message.channel.send(lang.general.areyousure);

                    collector.on("collect", msg => {
                        if (message.author.id !== msg.author.id) return; // Only the original author is allowed to answer

                        if (msg.content == "y") {
                            bot.data.settings.update({ guildid: guildid }, { $set: { memberaddroles: [] }}, {}, (err) => { if (err) logDbErr(err); });
                            message.channel.send(lf.rolearraycleared);
                        }

                        collector.stop();
                    });
                    break;

                default:
                    message.channel.send(lf.memberaddroleusage);
                    return;
            }
            break;

        case "levelsystem":
            if (!args[1]) args[1] = "";

            switch(args[1].toLowerCase()) {
                case "enable":
                    bot.data.settings.update({ guildid: guildid }, { $set: { levelsystem: true }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(lf.levelsystemenabled);
                    break;

                case "disable":
                    bot.data.settings.update({ guildid: guildid }, { $set: { levelsystem: false }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(lf.levelsystemdisabled);
                    break;

                default:
                    message.channel.send(lf.levelsystemusage);
                    return;
            }

            break;

        case "allownsfw":
            if (!args[1]) args[1] = "";

            switch(args[1].toLowerCase()) {
                case "enable":
                    bot.data.settings.update({ guildid: guildid }, { $set: { allownsfw: true }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(lf.allownsfwenabled);
                    break;

                case "disable":
                    bot.data.settings.update({ guildid: guildid }, { $set: { allownsfw: false }}, {}, (err) => { if (err) logDbErr(err); });
                    message.channel.send(lf.allownsfwdisabled);
                    break;

                default:
                    message.channel.send(lf.allownsfwusage);
                    return;
            }

            break;

        case "reset":
            message.channel.send(lang.general.areyousure);

            collector.on("collect", msg => {
                if (message.author.id !== msg.author.id) return; // Only the original author is allowed to answer

                if (msg.content == "y") {
                    bot.data.serverToSettings(bot.client, message.guild, null, true);
                    message.channel.send(lf.settingsreset);
                }

                collector.stop();
            });
            break;


        /* --------------- Display current settings --------------- */
        default:
            if (guildsettings.adminroles.length == 0 && guildsettings.moderatorroles.length == 0 && !guildsettings.systemchannel && !guildsettings.modlogchannel && !guildsettings.greetmsg && !guildsettings.byemsg && guildsettings.memberaddroles.length == 0) { // Only display this message if the user hasn't set anything yet
                embeddescription = lf.embeddescription.replace("prefix", guildsettings.prefix);
            } else {
                embeddescription = undefined;
            }

            message.channel.send({ embeds: [{
                title: `${lf.settingsfor} '${message.guild.name}'`,
                color: bot.misc.randomHex(),
                description: embeddescription,
                thumbnail: { url: message.guild.iconURL },
                fields: [{
                    name: "Prefix:",
                    value: `\`${guildsettings.prefix}\``,
                    inline: true },
                {
                    name: `${lang.general.language}:`,
                    value: lang.general.thislang,
                    inline: true },
                {
                    name: `${lf.adminroles}:`,
                    value: adminroles },
                {
                    name: `${lf.moderatorroles}:`,
                    value: moderatorroles },
                {
                    name: `${lf.systemchannel}:`,
                    value: systemchannel },
                {
                    name: `${lf.modlogchannel}:`,
                    value: modlogchannel,
                    inline: true },
                {
                    name: `${lf.modlogfeatures}:`,
                    value: modlogfeatures,
                    inline: true },
                {
                    name: `${lf.greetmsg}:`,
                    value: greetmsg },
                {
                    name: `${lf.byemsg}:`,
                    value: byemsg },
                {
                    name: `${lf.addroleonjoin}:`,
                    value: memberaddroles },
                {
                    name: `${lf.levelsystemactive}:`,
                    value: levelsystemstatus,
                    inline: true },
                {
                    name: `${lf.allownsfw}:`,
                    value: allownsfwstatus,
                    inline: true
                }
                ],
                footer: {
                    icon_url: message.author.displayAvatarURL(), // eslint-disable-line camelcase
                    text: `${lang.general.requestedby} @${message.author.displayName} • ${lang.cmd.help.help}: ${guildsettings.prefix}settings help`
                }
            }]
            });

            return;
    }
};

module.exports.info = {
    names: ["settings", "set"],
    description: "cmd.settings.infodescription",
    usage: "[\"help\"]",
    options: [
        {
            name: "help",
            description: "Responds with a help message",
            required: false,
            type: Discord.ApplicationCommandOptionType.Boolean
        }
    ],
    accessableby: ["admins"],
    allowedindm: false,
    nsfwonly: false
};
