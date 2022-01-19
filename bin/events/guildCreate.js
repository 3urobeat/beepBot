/*
 * File: guildCreate.js
 * Project: beepbot
 * Created Date: 07.02.2021 15:15:19
 * Author: 3urobeat
 * 
 * Last Modified: 19.01.2022 14:02:57
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


//This file contains code of the guildCreate event and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

const Discord = require('discord.js'); //eslint-disable-line

/**
 * The guildCreate event
 * @param {Discord.Client} bot The Discord client class
 * @param {Function} logger The logger function
 * @param {Discord.Guild} guild The Discord guild class
 */
module.exports.run = async (bot, logger, guild) => { //eslint-disable-line
    bot.fn.servertosettings(guild)
    logger('info', 'guildCreate.js', `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount-1} other members!`)
    
    //get suitable channel to post welcome message to
    let welcomechannel = null

    if (guild.systemChannelId) {
        welcomechannel = guild.systemChannelId //then check if guild has a systemChannel set
    } else {
        //well then try and get the first channel (rawPosition) where the bot has permissions to send a message
        //get all text channels into array and sort them by ascending rawPositions
        let textchannels = guild.channels.cache.filter(c => c.type == "GUILD_TEXT").sort((a, b) => a.rawPosition - b.rawPosition)
        welcomechannel = textchannels.find(c => c.permissionsFor(bot.user).has("SEND_MESSAGES")).id //find the first channel with perms
    }

    //if no channel was found try to contact the guild owner
    var guildowner = await guild.fetchOwner();


    //Prepare language select menu
    var langArray = []

    Object.values(bot.langObj).forEach((e, i) => { //push each language to the array
        langArray.push({
            label: e.general.thislang,
            emoji: e.general.langemote,
            value: Object.keys(bot.langObj)[i]
        })
    })

    var langComponents = [
        new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageSelectMenu()
                    .setCustomId('welcomeLang')
                    .setPlaceholder(`${bot.langObj["english"].general.langemote} ${bot.langObj["english"].general.botaddchooselang}`)
                    .addOptions(langArray)
            )
    ]
    

    //Send message
    if (!welcomechannel) var channelToSend = guildowner.user
        else var channelToSend = guild.channels.cache.get(welcomechannel)

    channelToSend.send({
        embeds: [{
            title: bot.langObj["english"].general.botaddtitle,
            description: bot.langObj["english"].general.botadddesc + bot.langObj["english"].general.botadddesc2.replace(/prefix/g, bot.constants.DEFAULTPREFIX) + bot.langObj["english"].general.botadddesc3.replace(/prefix/g, bot.constants.DEFAULTPREFIX),
            thumbnail: { url: bot.user.displayAvatarURL() }
        }],
        components: langComponents
    })
        .catch((err) => { logger("warn", "guildCreate.js", "Failed to send owner welcome msg on createGuild: " + err) })


    //Handle beepBot muted roles
    //Ensure that @everyone hasn't manage role enabled so that users can't remove the muted role from them
    guild.roles.cache.get(guild.id).setPermissions(guild.roles.cache.get(guild.id).permissions.remove("MANAGE_ROLES"), "Needed so that users are unable to remove the beepBot Muted role from their own roles.") //permissions.remove only returns the changed bitfield
        .catch((err) => channelToSend.send("I was unable to remove the 'Manage Roles' permission from the `@everyone` role!\nPlease do this manually as otherwise muted users will be able to remove the 'beepBot Muted' role from themselves, effectively unmuting themselves again!\n|| Error: " + err + " ||")) //this doesn't need to be in a language file as the user didn't have the opportunity yet to change the lang anyway


    //Update perms of role in all channels (function because I need to call it two times from different blocks below)
    function updatePerms(role) {
        var errormsgsent = false

        guild.channels.cache.forEach((channel) => {
            if (channel.type != "GUILD_TEXT") return;

            channel.permissionOverwrites.create(role, { SEND_MESSAGES: false, ADD_REACTIONS: false }, "Needed change so that a muted user will be unable to send and react to messages.")
                .catch((err) => { 
                    if (!errormsgsent) guild.channels.cache.get(welcomechannel).send(`I was sadly unable to change the permissions of the 'beepBot Muted' role in all channels.\nYou can fix this by checking/correcting my permissions and then running the mute command once.\nError: ${err}`) //message can technically only be in English - also: send this message only once
                })
        }) 
    }

    //Create beepBot Muted role if it doesn't exist (this code is used again in mute.js)
    var mutedRole = guild.roles.cache.find(role => role.name == "beepBot Muted")

    if (!mutedRole) {
        guild.roles.create({
            name: "beepBot Muted",
            color: "#99AAB5",
            reason: "Role needed to chat-mute users using the mute command." 
        })
            .then((role) => { updatePerms(role) }) //after creating role change permissions of every text channel
            .catch((err) => { guild.channels.cache.get(welcomechannel).send(`I was unable to create the 'beepBot Muted' role.\nError: ${err}`) }) //message can only be in English and shouldn't even occurr because the permission is already included in the invite link (same with the error above but you never know)    
    } else {
        updatePerms(mutedRole);
    }
}