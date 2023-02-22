/*
 * File: voiceStateUpdate.js
 * Project: beepbot
 * Created Date: 11.02.2021 18:54:00
 * Author: 3urobeat
 *
 * Last Modified: 18.11.2021 20:25:34
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// This file contains code of the voiceStateUpdate event and is called by bot.js
// I did this to reduce the amount of lines in bot.js to make finding stuff easier.

const Discord = require('discord.js'); //eslint-disable-line

/**
 * The voiceStateUpdate event
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.VoiceState} oldstate The Discord VoiceState class of the oldstate
 * @param {Discord.VoiceState} newstate The Discord VoiceState class of the newstate
 */
module.exports.run = (bot, oldstate, newstate) => {
    if (!oldstate || !newstate) return; // Dunno why but I once got a 'Cannot read property 'id' of null' so maybe it can be undefined? dunno but it is weird

    bot.settings.findOne({ guildid: oldstate.guild.id }, (err, gs) => {
        if (err) gs = bot.langObj["english"];

        // Check if this update is caused by someone who needs their mute status changed
        bot.timedmutes.findOne({$and: [{ userid: newstate.member.id }, { guildid: newstate.guild.id }] }, (err, doc) => {
            if (!doc) return; // Nothing found

            if (doc.where == "all" || doc.where == "voice") { // Check if the mute type is voice
                if (doc.type == "tempmute" || doc.type == "permmute" && !newstate.member.voice.serverMute) { // Check if user is not muted (serverMute returns true or false) but should be muted
                    // Mute and attach reason for audit log
                    newstate.member.voice.setMute(true, bot.langObj[gs.lang].general.voicestateupdatemutereason.replace("muteauthor", newstate.guild.members.cache.get(doc.authorid).user.username).replace("reasontext", doc.mutereason)).catch(() => { });
                }

                if (doc.type == "unmute") {
                    newstate.member.voice.setMute(false, bot.langObj[gs.lang].general.voicestateupdateunmutereason.replace("muteauthor", newstate.guild.members.cache.get(doc.authorid).user.username).replace("reasontext", doc.mutereason)).catch(() => { });
                    bot.timedmutes.remove({$and: [{ userid: newstate.member.id }, { guildid: newstate.guild.id }]});
                }
            }
        });
    });
};