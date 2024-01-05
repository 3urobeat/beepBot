/*
 * File: mute.js
 * Project: beepbot
 * Created Date: 2021-02-11 18:54:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-05 23:17:25
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require('discord.js'); //eslint-disable-line

/**
 * The mute command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {object} guildsettings All settings of this guild
 * @param {object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    let lf = lang.cmd.mute;

    // Check if role was successfully created by guildCreate.js (where this code is also used)
    /**
     *
     */
    function checkMutedRole() {
        return new Promise((resolve, reject) => {
            let mutedrole = message.guild.roles.cache.find(role => role.name == "beepBot Muted");
            let errorcount = 0;

            if (!mutedrole) {
                message.guild.roles.create({
                    name: "beepBot Muted",
                    color: "#99AAB5",
                    reason: lf.rolecreatereason
                })
                    .then((role) => { // After creating role change permissions of every text channel
                        message.guild.channels.cache.forEach((channel) => {
                            if (channel.type != Discord.ChannelType.GuildText) return;

                            channel.permissionOverwrites.create(role, { "SendMessages": false, "AddReactions": false }, lf.rolechannelpermreason)
                                .catch((err) => {
                                    if (errorcount < 1) message.channel.send(`${lf.rolechannelpermerror}\n${lang.general.error}: ${err}`);
                                    errorcount++; // We don't want to spam the channel
                                    return reject();
                                });
                        });

                        resolve(); // Resolve promise
                    })
                    .catch((err) => {
                        message.channel.send(`${lf.rolecreateerror}\n${lang.general.error}: ${err}`);
                        return reject();
                    });

            } else { // Role seems to exist so lets check if all channels have it added to their permissions
                message.guild.channels.cache.forEach((channel) => {
                    if (channel.type != Discord.ChannelType.GuildText) return;
                    if (!channel.permissionsFor(mutedrole).has(Discord.PermissionFlagsBits.SendMessages) && !channel.permissionsFor(mutedrole).has(Discord.PermissionFlagsBits.AddReactions)) return; // If this channel already has both perms set to false then skip this iteration

                    channel.permissionOverwrites.create(mutedrole, { "SendMessages": false, "AddReactions": false }, lf.rolechannelpermreason)
                        .catch((err) => {
                            if (errorcount < 1) message.channel.send(`${lf.rolechannelpermerror}\n${lang.general.error}: ${err}`);
                            errorcount++; // We don't want to spam the channel
                            return reject();
                        });
                });

                resolve(); // Resolve promise
            }
        });
    }

    await checkMutedRole(); // Call function and wait for resolved promise


    // Get user and do other checks
    let args0 = ["chat", "voice", "all"]; // Things args[0] should be
    if (!args0.includes(args[0])) return message.channel.send(lf.invalidargs.replace("prefix", guildsettings.prefix));

    let muteuser = fn.getuserfrommsg(message, args, 1, null, false, ["-r", "-t", "-n"]);
    if (!muteuser) return message.channel.send(lang.general.usernotfound);
    if (typeof (muteuser) == "number") return message.channel.send(lang.general.multipleusersfound.replace("useramount", muteuser));

    if (muteuser.id == bot.user.id) return message.channel.send(fn.randomstring(lf.botmute));
    if (muteuser.id == message.author.id) return message.channel.send(lf.selfmute);


    // Get reason if there is one provided
    let mutereason, mutereasontext = "";

    fn.getreasonfrommsg(args, ["-time", "-t", "-notify", "-n", undefined], (reason, reasontext) => {
        mutereason = reason;
        mutereasontext = reasontext;
    });


    if (args[0].toLowerCase() == "chat" || args[0].toLowerCase() == "all") {
        let mutedrole = message.guild.roles.cache.find(role => role.name == "beepBot Muted");

        if (mutedrole) {
            // Apply role
            message.guild.members.cache.get(muteuser.id).roles.add(mutedrole, mutereason)
                .catch(err => { // Catch error of role adding
                    return message.channel.send(`${lf.roleadderror.replace("muteuser", muteuser.username)}\n${lang.general.error}: ${err}`);
                });
        }
    }

    if (args[0].toLowerCase() == "voice" || args[0].toLowerCase() == "all") {
        // Apply voicemute if muteuser is in voice chat, if not the voiceStateUpdate event in bot.js will handle muting
        if (message.guild.members.cache.get(muteuser.id).voice.channel != null) {
            message.guild.members.cache.get(muteuser.id).voice.setMute(true, mutereason)
                .catch(err => {
                    return message.channel.send(`${lf.voicemuteerror.replace("muteuser", muteuser.username)}\n${lang.general.error}: ${err}`);
                });
        }
    }


    // Add timed mute to db and respond with msg
    let notifytimetext = lang.cmd.ban.permanent; // Needed for notify - if not permanent it will get changed by the time argument code block below (and yes just hijack the translation from the ban cmd)

    if (args.includes("-time") || args.includes("-t")) { // Timed mute
        fn.gettimefrommsg(args, (timeinms, unitindex, arrcb) => { // The 3 arguments inside brackets are arguments from the callback
            if (!timeinms) return message.channel.send(lang.general.unsupportedtime.replace("timeargument", arrcb[1]));

            let timedmuteobj = {
                type: "tempmute", // Used to determine what action to take by the voiceStateUpdate event
                userid: muteuser.id,
                until: Date.now() + timeinms,
                where: args[0].toLowerCase(),
                guildid: message.guild.id,
                authorid: message.author.id,
                mutereason: mutereasontext
            };

            notifytimetext = `${arrcb[0]} ${lang.general.gettimefuncoptions[unitindex]}`; // Change permanent to timetext

            bot.timedmutes.remove({$and: [{ userid: muteuser.id }, { guildid: message.guild.id }]}, (err) => { if (err) logger("error", "mute.js", `error removing user ${muteuser.id}: ${err}`); }); // Remove an old entry if there should be one
            bot.timedmutes.insert(timedmuteobj, (err) => { if (err) logger("error", "mute.js", "error inserting user: " + err); });
            message.channel.send(lf.tempmutemsg.replace("username", muteuser.username).replace("timetext", notifytimetext).replace("mutereasontext", mutereasontext));
        });

    } else { // Permanent mute
        let permmuteobj = {
            type: "permmute", // Used to determine what action to take by the voiceStateUpdate event
            userid: muteuser.id,
            where: "voice",
            guildid: message.guild.id,
            authorid: message.author.id,
            mutereason: mutereasontext
        };

        bot.timedmutes.remove({$and: [{ userid: muteuser.id }, { guildid: message.guild.id }]}, (err) => { if (err) logger("error", "mute.js", `error removing user ${muteuser.id}: ${err}`); }); // Remove an old entry if there should be one
        bot.timedmutes.insert(permmuteobj, (err) => { if (err) logger("error", "mute.js", "error inserting user: " + err); });
        message.channel.send(lf.permmutemsg.replace("username", muteuser.username).replace("mutereasontext", mutereasontext));
    }

    message.react("✅").catch(() => {}); // Catch but ignore error
    fn.msgtomodlogchannel(message.guild, "mute", message.author, muteuser, [args[0].toLowerCase(), mutereasontext, notifytimetext, args.includes("-notify") || args.includes("-n")]); // Details[2] results in boolean

    // Notify user if author provided argument
    if (args.includes("-notify") || args.includes("-n")) {
        if (!muteuser.bot) muteuser.send(lf.mutenotifymsg.replace("servername", message.guild.name).replace("mutereasontext", mutereasontext).replace("timetext", notifytimetext)).catch(err => {
            message.channel.send(lang.general.dmerror + err);
        });
    }
};

module.exports.info = {
    names: ["mute"],
    description: "cmd.mute.infodescription",
    usage: '("voice"/"chat"/"all") (mention/username) [-r reason] [-time/-t Number "seconds"/"minutes"/"hours"/"days"/"months"/"years"] [-notify/-n]',
    options: [
        {
            name: "type",
            description: "Select if the user should be muted in voice, chat or both",
            required: true,
            type: Discord.ApplicationCommandOptionType.String,
            choices: [
                { name: "Voice", value: "voice" },
                { name: "Chat", value: "chat" },
                { name: "Both", value: "all" }
            ]
        },
        {
            name: "user",
            description: "The user to mute",
            required: true,
            type: Discord.ApplicationCommandOptionType.User
        },
        {
            name: "reason",
            description: "The reason of the mute",
            required: false,
            type: Discord.ApplicationCommandOptionType.String,
            prefix: "-r"
        },
        {
            name: "time",
            description: "Provide a duration and timeframe to only temporary mute the user",
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
            description: "If the user should be notified of the mute and reason",
            required: false,
            type: Discord.ApplicationCommandOptionType.Boolean,
            prefix: "-n"
        }
    ],
    accessableby: ["moderators"],
    allowedindm: false,
    nsfwonly: false
};
