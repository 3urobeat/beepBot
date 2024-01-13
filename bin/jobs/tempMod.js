/*
 * File: tempMod.js
 * Project: beepbot
 * Created Date: 2024-01-06 09:44:05
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 12:14:36
 * Modified By: 3urobeat
 *
 * Copyright (c) 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Controller = require("../controller.js");


/**
 * Attaches jobs for lifting temporary mod actions, like mutes and bans
 */
Controller.prototype._attachTempModJob = function() {

    // Unban checker
    let lastTempBanCheck = Date.now(); // This is useful because intervals can get unprecise over time

    setInterval(() => {
        if (lastTempBanCheck + 10000 > Date.now()) return; // Last check is more recent than 10 seconds
        lastTempBanCheck = Date.now();

        this.data.timedbans.loadDatabase((err) => { // Needs to be loaded with each iteration so that changes get loaded
            if (err) return logger("warn", "tempMod.js", "Error loading timedbans database: " + err);
        });

        this.data.timedbans.find({ until: { $lte: Date.now() } }, (err, docs) => { // Until is a date in ms, so we check if it is less than right now
            if (docs.length < 1) return; // Nothing found

            docs.forEach((e) => { // Take action for all results
                this.Manager.broadcastEval((client, context) => {
                    let e     = context.e; // Make calling e shorter
                    let guild = client.guilds.cache.get(e.guildid);

                    if (guild) {
                        // Add ids as fallback option for msgToModlogChannel
                        let authorobj = guild.members.cache.get(e.authorid); // Try to populate obj with actual data
                        let receiverobj = guild.members.cache.get(e.userid);

                        if (!authorobj) authorobj = {}; // Set blank if check failed
                        if (!receiverobj) receiverobj = {};
                        authorobj["userid"] = e.authorid; // Add id as fallback should getting actual data failed
                        receiverobj["userid"] = e.userid;

                        client.bot.data.timedbans.remove({$and: [{ userid: e.userid }, { guildid: e.guildid }] }, (err) => {
                            if (err) logger("error", "tempMod.js", `Error removing ${e.userid} from timedbans: ${err}`);
                        });

                        guild.members.unban(e.userid)
                            .then(res => {
                                if (Object.keys(res).length > 1) receiverobj = res; // Overwrite receiverobj if we actually have data from the unban response

                                client.bot.msgToModlogChannel(guild, "unban", authorobj, receiverobj, [e.banreason]);
                            })
                            .catch(err => {
                                if (err != "DiscordAPIError: Unknown Ban") return client.bot.msgToModlogChannel(guild, "unbanerr", authorobj, receiverobj, [e.banreason, err]); // If unknown ban ignore, user has already been unbanned
                            });
                    }
                }, { context: { e: e } }) // Pass e as context to be able to access it inside
                    .catch(err => {
                        logger("warn", "tempMod.js", "Couldn't broadcast unban: " + err.stack);
                        if (err == "Error [ShardingInProcess]: Shards are still being spawned") return; // Do not remove from db when shards are being spawned
                    });
            });
        });
    }, 10000); // 10 seconds


    // Unmute checker
    let lastTempMuteCheck = Date.now(); // This is useful because intervals can get unprecise over time

    setInterval(() => {
        if (lastTempMuteCheck + 10000 > Date.now()) return; // Last check is more recent than 10 seconds
        lastTempMuteCheck = Date.now();

        this.data.timedmutes.loadDatabase((err) => { // Needs to be loaded with each iteration so that changes get loaded
            if (err) return logger("warn", "tempMod.js", "Error loading timedbans database: " + err);
        });

        this.data.timedmutes.find({ until: { $lte: Date.now() } }, (err, docs) => { // Until is a date in ms, so we check if it is less than right now
            if (docs.length < 1) return; // Nothing found

            docs.forEach((e) => { // Take action for all results
                if (e.type != "tempmute") return; // Only handle mutes that are temporary and should result in a unmute

                this.Manager.broadcastEval((client, context) => {
                    let e     = context.e; // Make calling e shorter
                    let guild = client.guilds.cache.get(e.guildid);

                    if (guild) {
                        // Add ids as fallback option for msgToModlogChannel
                        let authorobj = guild.members.cache.get(e.authorid).user; // Try to populate obj with actual data
                        let receiverobj = guild.members.cache.get(e.userid).user;

                        if (!authorobj) authorobj = {}; // Set blank if check failed
                        if (!receiverobj) receiverobj = {};
                        authorobj["userid"] = e.authorid; // Add id as fallback should getting actual data failed
                        receiverobj["userid"] = e.userid;

                        if (e.where == "chat" || e.where == "all") { // User was muted in chat
                            let mutedrole = guild.roles.cache.find(role => role.name == "beepBot Muted");

                            if (mutedrole) { // Only proceed if role still exists
                                // Remove role
                                guild.members.cache.get(e.userid).roles.remove(mutedrole).catch(err => { // Catch error of role adding
                                    return client.bot.msgToModlogChannel(guild, "unmuteerr", authorobj, receiverobj, [e.mutereason, err]);
                                });
                            }
                        }

                        // Remove matching userid and guildid entries from db now so that voiceStateUpdate won't attack
                        client.bot.data.timedmutes.remove({$and: [{ userid: e.userid }, { guildid: e.guildid }]}, (err) => {
                            if (err) client.fn.logger("error", "tempMod.js", `Error removing ${e.userid} from timedmutes: ${err}`);
                        });

                        if (e.where == "voice" || e.where == "all") { // User was banned in voice
                            // Remove voice mute
                            if (guild.members.cache.get(e.userid).voice.channel != null) {
                                guild.members.cache.get(e.userid).voice.setMute(false).catch(err => {
                                    return client.bot.msgToModlogChannel(guild, "unmuteerr", authorobj, receiverobj, [e.mutereason, err]);
                                });
                            } else {
                                // If the user can't be unmuted right now push it into the db and handle it with the voiceStateUpdate event
                                let unmuteobj = {
                                    type: "unmute", // Used to determine what action to take by the voiceStateUpdate event if the user can't be muted right now
                                    userid: e.userid,
                                    where: "voice",
                                    guildid: e.guildid,
                                    authorid: e.authorid,
                                    mutereason: e.mutereason
                                };

                                client.bot.data.timedmutes.insert(unmuteobj, (err) => {
                                    if (err) client.fn.logger("error", "tempMod.js", "error updating db: " + err); // Insert new obj instead of updating old one so that the db remove call won't remove it
                                });
                            }
                        }

                        client.bot.msgToModlogChannel(guild, "unmute", authorobj, receiverobj, ["auto", e.mutereason]);
                    }
                }, { context: { e: e } }) // Pass e as context to be able to access it inside
                    .catch(err => {
                        if (err == "Error [ShardingInProcess]: Shards are still being spawned") return;
                        logger("warn", "tempMod.js", "Couldn't broadcast unmute: " + err.stack);
                    });
            });
        });
    }, 10000); // 10 seconds

};
