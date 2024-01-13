/*
 * File: voiceStateUpdate.js
 * Project: beepbot
 * Created Date: 2021-02-11 18:54:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 12:31:09
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Bot = require("../bot.js");


/**
 * Handles discord.js's voiceStateUpdate event of this shard
 */
Bot.prototype._attachDiscordVoiceStateUpdateEvent = function() {

    this.client.on("voiceStateUpdate", (oldstate, newstate) => {

        if (!oldstate || !newstate) return; // Dunno why but I once got a 'Cannot read property 'id' of null' so maybe it can be undefined? dunno but it is weird

        this.data.settings.findOne({ guildid: oldstate.guild.id }, (err, gs) => {
            if (err) gs = this.data.langObj["english"];

            // Check if this update is caused by someone who needs their mute status changed
            this.data.timedmutes.findOne({$and: [{ userid: newstate.member.id }, { guildid: newstate.guild.id }] }, (err, doc) => {
                if (!doc) return; // Nothing found

                if (doc.where == "all" || doc.where == "voice") { // Check if the mute type is voice
                    if (doc.type == "tempmute" || doc.type == "permmute" && !newstate.member.voice.serverMute) { // Check if user is not muted (serverMute returns true or false) but should be muted
                        // Mute and attach reason for audit log
                        newstate.member.voice.setMute(true, this.data.langObj[gs.lang].general.voicestateupdatemutereason.replace("muteauthor", newstate.guild.members.cache.get(doc.authorid).user.displayName).replace("reasontext", doc.mutereason)).catch(() => { });
                        logger("debug", "voiceStateUpdate.js", `Detected manual server unmute of '${newstate.member.user.displayName}' (${newstate.member.id}), re-muting them as a beepBot mute exists...`);
                    }

                    if (doc.type == "unmute") {
                        newstate.member.voice.setMute(false, this.data.langObj[gs.lang].general.voicestateupdateunmutereason.replace("muteauthor", newstate.guild.members.cache.get(doc.authorid).user.displayName).replace("reasontext", doc.mutereason)).catch(() => { });
                        this.data.timedmutes.remove({$and: [{ userid: newstate.member.id }, { guildid: newstate.guild.id }]});
                    }
                }
            });
        });

    });

};
