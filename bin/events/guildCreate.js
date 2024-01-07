/*
 * File: guildCreate.js
 * Project: beepbot
 * Created Date: 2021-02-07 15:15:19
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-07 19:31:32
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js");

const Bot = require("../bot.js");


/**
 * Handles discord.js's guildCreate event of this shard
 */
Bot.prototype._attachDiscordGuildCreateEvent = function() {

    this.client.on("guildCreate", async (guild) => {

        bot.fn.servertosettings(guild);
        logger("info", "guildCreate.js", `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount - 1} other members!`);

        // Get suitable channel to post welcome message to
        let welcomechannel = null;

        if (guild.systemChannelId) {
            welcomechannel = guild.systemChannelId; // Then check if guild has a systemChannel set

        } else { // ...well then try and get the first channel (rawPosition) where the bot has permissions to send a message

            // Get all text channels into array and sort them by ascending rawPositions
            let textchannels = guild.channels.cache.filter((c) => c.type == Discord.ChannelType.GuildText).sort((a, b) => a.rawPosition - b.rawPosition);

            welcomechannel = textchannels.find((c) => c.permissionsFor(this.client.user).has(Discord.PermissionFlagsBits.SendMessages)).id; // Find the first channel with perms
        }

        // If no channel was found try to contact the guild owner
        let guildowner = await guild.fetchOwner();


        // Prepare language select menu
        let langArray = [];

        Object.values(this.data.langObj).forEach((e, i) => { // Push each language to the array
            langArray.push({
                label: e.general.thislang,
                emoji: e.general.langemote,
                value: Object.keys(this.data.langObj)[i]
            });
        });

        let langComponents = [
            new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.SelectMenuBuilder()
                        .setCustomId("welcomeLang")
                        .setPlaceholder(`${this.data.langObj["english"].general.langemote} ${this.data.langObj["english"].general.botaddchooselang}`)
                        .addOptions(langArray)
                )
        ];


        // Send message. Default to owner DMs, if we found a suitable welcome channel, then set to that.
        let channelToSend = guildowner.user;

        if (welcomechannel) channelToSend = guild.channels.cache.get(welcomechannel);

        channelToSend.send({
            embeds: [{
                title: this.data.langObj["english"].general.botaddtitle,
                description: this.data.langObj["english"].general.botadddesc + this.data.langObj["english"].general.botadddesc2.replace(/prefix/g, this.data.constants.DEFAULTPREFIX) + this.data.langObj["english"].general.botadddesc3.replace(/prefix/g, this.data.constants.DEFAULTPREFIX),
                thumbnail: { url: this.client.user.displayAvatarURL() }
            }],
            components: langComponents
        })
            .catch((err) => { logger("warn", "guildCreate.js", "Failed to send owner welcome msg on createGuild: " + err); });


        // Handle beepBot muted roles
        // Ensure that @everyone hasn't manage role enabled so that users can't remove the muted role from them
        guild.roles.cache.get(guild.id).setPermissions(guild.roles.cache.get(guild.id).permissions.remove(Discord.PermissionFlagsBits.ManageRoles), "Needed so that users are unable to remove the beepBot Muted role from their own roles.") // Permissions.remove only returns the changed bitfield
            .catch((err) => channelToSend.send("I was unable to remove the 'Manage Roles' permission from the `@everyone` role!\nPlease do this manually as otherwise muted users will be able to remove the 'beepBot Muted' role from themselves, effectively unmuting themselves again!\n|| Error: " + err + " ||")); // This doesn't need to be in a language file as the user didn't have the opportunity yet to change the lang anyway


        // Update perms of role in all channels (function because I need to call it two times from different blocks below)
        function updatePerms(role) {
            let errormsgsent = false;

            guild.channels.cache.forEach((channel) => {
                if (channel.type != Discord.ChannelType.GuildText) return;

                channel.permissionOverwrites.create(role, { "SendMessages": false, "AddReactions": false }, "Needed change so that a muted user will be unable to send and react to messages.")
                    .catch((err) => {
                        if (!errormsgsent) guild.channels.cache.get(welcomechannel).send(`I was sadly unable to change the permissions of the 'beepBot Muted' role in all channels.\nYou can fix this by checking/correcting my permissions and then running the mute command once.\nError: ${err}`); // Message can technically only be in English - also: send this message only once
                    });
            });
        }

        // Create beepBot Muted role if it doesn't exist (this code is used again in mute.js)
        let mutedRole = guild.roles.cache.find(role => role.name == "beepBot Muted");

        if (!mutedRole) {
            guild.roles.create({
                name: "beepBot Muted",
                color: "#99AAB5",
                reason: "Role needed to chat-mute users using the mute command."
            })
                .then((role) => { updatePerms(role); }) // After creating role change permissions of every text channel
                .catch((err) => { guild.channels.cache.get(welcomechannel).send(`I was unable to create the 'beepBot Muted' role.\nError: ${err}`); }); // Message can only be in English and shouldn't even occurr because the permission is already included in the invite link (same with the error above but you never know)
        } else {
            updatePerms(mutedRole);
        }

    });

};
