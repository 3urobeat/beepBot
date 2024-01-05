/*
 * File: msgtomodlogchannel.js
 * Project: beepbot
 * Created Date: 2021-02-07 15:43:03
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-05 23:24:14
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// This file contains code of the msgtomodlogchannel function and is called by bot.js
// I did this to reduce the amount of lines in bot.js to make finding stuff easier.

const Discord = require('discord.js'); //eslint-disable-line

/**
 * The msgtomodlogchannel helper function
 * @param {Discord.Client} bot The Discord client class
 * @param {Function} logger Reference to the logger function
 * @param {Discord.Guild} guild The Discord guild class
 * @param {String} action The type of the modlog event (clear, unban, kick, etc.)
 * @param {Discord.User} author The Discord user class of the message author
 * @param {Discord.User} receiver The Discord user class of the action recipient
 * @param {Array} details Array containing further information like the reasontext and if the user should be notified
 */
module.exports.run = (bot, logger, guild, action, author, receiver, details) => {
    bot.settings.findOne({ guildid: guild.id }, (err, guildsettings) => {
        if (guildsettings.modlogfeatures && !guildsettings.modlogfeatures.includes(action) && !action.includes("err")) return; // User turned off this modlogfeature and it isn't an err

        if (!guildsettings || !guildsettings.modlogchannel || action == "modlogmsgerr") { // If modlogchannel is undefined (turned off) or a previous modlogmsg failed
            if (action.includes("err")) { // If error, then find a channel to inform someone
                if (guildsettings.systemchannel) {
                    guildsettings.modlogchannel = guildsettings.systemchannel; // If no modlogchannel set, try systemchannel
                } else if (guild.systemChannelId) {
                    guildsettings.modlogchannel = guild.systemChannelId; // Then check if guild has a systemChannel set
                } else {
                    // Well then try and get the first channel (rawPosition) where the bot has permissions to send a message
                    guildsettings.modlogchannel = null; // Better set it to null to avoid potential problems

                    // Get all text channels into array and sort them by ascending rawPositions
                    let textchannels = guild.channels.cache.filter(c => c.type == Discord.ChannelType.GuildText).sort((a, b) => a.rawPosition - b.rawPosition);
                    guildsettings.modlogchannel = textchannels.find(c => c.permissionsFor(bot.user).has(Discord.PermissionFlagsBits.SendMessages)).id; // Find the first channel with perms

                    if (!guildsettings.modlogchannel) return; // If it couldn't find a channel then stop
                }

                if (!guildsettings || !guildsettings.lang) guildsettings.lang = bot.constants.defaultguildsettings.lang; // Set default lang to suppress error from lang function
            } else {
                return; // Yes well if it isn't an error then stop
            }
        }

        let guildlang = bot.fn.lang(guild.id, guildsettings);

        // Avoid errors from controller.js unban broadcastEval
        if (!author["username"]) author["username"] = "ID: " + author.userid; // Userid will always be defined (look at controller.js unban broadcastEval)
        if (!author["discriminator"]) author["discriminator"] = "????";
        if (!receiver["username"]) receiver["username"] = "ID: " + receiver.userid;
        if (!receiver["discriminator"]) receiver["discriminator"] = "????";


        // Construct the embed to send
        let embed = {
            title: "",
            color: null,
            fields: [],
            footer: { icon_url: bot.user.displayAvatarURL(), text: guildlang.general.modlogdeletewithreaction }
        };

        switch (action) {
            case "clear":
                embed.title = guildlang.general.modlogcleartitle.replace("author", `${author.username}#${author.discriminator}`).replace("clearamount", details[0]).replace("channelname", "#" + details[1].name);
                embed.color = 16753920; // Orange
                break;

            case "kick":
                embed.title = guildlang.general.modlogkicktitle.replace("author", `${author.username}#${author.discriminator}`).replace("receiver", `${receiver.username}#${receiver.discriminator}`);
                embed.color = 16753920; // Orange
                embed.fields.push({ name: `${guildlang.general.reason}:`, value: details[0] });
                embed.fields.push({ name: `${guildlang.general.details}:`, value: guildlang.general.modloguserwasnotified + String(details[1]).replace("true", "✅").replace("false", "❌") }); // Details[1] is a boolean if the user was notified
                break;

            case "ban":
                embed.title = guildlang.general.modlogbantitle.replace("author", `${author.username}#${author.discriminator}`).replace("receiver", `${receiver.username}#${receiver.discriminator}`);
                embed.color = 16711680; // Red
                embed.fields.push({ name: `${guildlang.general.reason}:`, value: details[0] });
                embed.fields.push({ name: `${guildlang.general.details}:`,
                                        value: `${guildlang.general.length}: ${details[1]}
                                                ${guildlang.general.modloguserwasnotified}${String(details[2]).replace("true", "✅").replace("false", "❌")}`
                                    });
                break;

            case "unban":
                embed.title = guildlang.general.modlogunbantitle.replace("receiver", `${receiver.username}#${receiver.discriminator}`);
                embed.color = 65280; // Green
                embed.fields.push({ name: `${guildlang.general.reason}:`, value: details[0] });
                break;

            case "unbanerr":
                embed.title = guildlang.general.modlogunbanerrtitle.replace("receiver", `${receiver.username}#${receiver.discriminator}`);
                embed.color = 14725921; // Some orange mixture
                embed.fields.push({ name: `${guildlang.general.error}:`, value: details[1] });
                embed.fields.push({ name: `${guildlang.general.reason}:`, value: details[0] });
                break;

            case "movemsg":
                if (details[0] == "convo") { // Conversation got moved
                    embed.title = guildlang.general.modlogmoveconvotitle.replace("author", `${author.username}#${author.discriminator}`).replace("amount", details[1]);
                    embed.color = 65280; // Green
                    embed.fields.push({ name: `${guildlang.general.channels}`, value: `<#${details[3]}> -> <#${details[4]}>` }); // Originalchannel -> movechannel
                    embed.fields.push({ name: `${guildlang.general.reason}:`, value: details[2] });
                } else {
                    embed.title = guildlang.general.modlogmovemsgtitle.replace("author", `${author.username}#${author.discriminator}`).replace("receiver", `${receiver.username}#${receiver.discriminator}`);
                    embed.color = 65280; // Green
                    embed.fields.push({ name: `${guildlang.general.modlogmovemsgcontent}:`, value: details[1] }); // Attachment is already in messagecontent
                    embed.fields.push({ name: `${guildlang.general.channels}`, value: `<#${details[3]}> -> <#${details[4]}>` }); // Originalchannel -> movechannel
                    embed.fields.push({ name: `${guildlang.general.reason}:`, value: details[2] });
                }
                break;

            case "mute":
                if (details[0] == "all") details[0] = "voice, chat"; // Change term to make it more understandable

                embed.title = guildlang.general.modlogmutetitle.replace("author", `${author.username}#${author.discriminator}`).replace("receiver", `${receiver.username}#${receiver.discriminator}`);
                embed.color = 16753920; // Orange
                embed.fields.push({ name: `${guildlang.general.reason}:`, value: details[1] });
                embed.fields.push({ name: `${guildlang.general.details}:`,
                                    value: `${guildlang.general.where}: ${details[0]}
                                            ${guildlang.general.length}: ${details[2]}
                                            ${guildlang.general.modloguserwasnotified}${String(details[3]).replace("true", "✅").replace("false", "❌")}`
                                    });
                break;

            case "unmute":
                embed.title = guildlang.general.modlogunmutetitle.replace("receiver", `${receiver.username}#${receiver.discriminator}`);
                embed.color = 65280; // Green
                embed.fields.push({ name: `${guildlang.general.reason}:`, value: details[1] });

                if (details[0] == "manual") embed.fields.push({ name: `${guildlang.general.modlogunmutedby}:`, value: `${author.username}#${author.discriminator}` }); // We only care about this information if the unmute was executed by the unmute cmd
                break;

            case "unmuteerr":
                embed.title = guildlang.general.modlogunmuteerrtitle.replace("receiver", `${receiver.username}#${receiver.discriminator}`);
                embed.color = 14725921; // Some orange mixture
                embed.fields.push({ name: `${guildlang.general.error}:`, value: details[1] });
                embed.fields.push({ name: `${guildlang.general.reason}:`, value: details[0] });
                break;

            case "modlogmsgerr":
                embed.title = guildlang.general.modlogmsgerrtitle;
                embed.color = 16711680; // Red
                embed.fields.push({ name: `${guildlang.general.error}:`, value: details[0] });
                embed.fields.push({ name: `${guildlang.general.message}:`, value: details[1] });
                break;

            default:
                return logger("error", "msgtomodlogchannel.js", "Unsupported action: " + action);
        }


        // Construct the delete message button component
        let buttonComponent = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("modlogMessageDeleteButton") // Give the button an ID so that our interaction event handler knows what to do with it
                .setEmoji("🗑️")
                .setStyle(Discord.ButtonStyle.Secondary)
        );


        // Find our modlogchannel
        let modlogchannel = guild.channels.cache.get(guildsettings.modlogchannel);

        // Abort if modlogchannel can't be found
        if (!modlogchannel) {
            bot.fn.msgtomodlogchannel(guild, "modlogmsgerr", author, receiver, [guildlang.general.modlogchannelnotfound.replace("channelid", guildsettings.modlogchannel), embed.title]);
            bot.settings.update({ guildid: guild.id }, { $set: { modlogchannel: bot.constants.defaultguildsettings.modlogchannel }}, {}, () => { }); // Reset setting
            return;
        }


        // Send message into modlogchannel with embed and delete button
        guild.channels.cache.get(guildsettings.modlogchannel).send({
            embeds: [embed],
            components: [buttonComponent]
        })
            .catch((err) => { // Sendmsg error catch
                if (err) return bot.fn.msgtomodlogchannel(guild, "modlogmsgerr", author, receiver, [err, embed.title]); // Call this same function again to notify that modlogmsgs can't be sent (won't end in a loop because if no channel can be found on err then it will stop)
            });
    });
};
