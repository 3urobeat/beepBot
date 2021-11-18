/*
 * File: kick.js
 * Project: beepbot
 * Created Date: 13.12.2020 17:41:00
 * Author: 3urobeat
 * 
 * Last Modified: 18.11.2021 20:21:32
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


const Discord = require('discord.js'); //eslint-disable-line

/**
 * The kick command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The recieved message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { 
    var Discord = require("discord.js");

    var kickuser = fn.getuserfrommsg(message, args, 0, null, false, ["-r", "-n"]);
    if (!kickuser) return message.channel.send(lang.general.usernotfound)
    if (typeof (kickuser) == "number") return message.channel.send(lang.general.multipleusersfound.replace("useramount", kickuser))

    var guildowner = await message.guild.fetchOwner();

    if (guildowner && guildowner.user.id !== message.author.id && message.guild.members.cache.get(kickuser.id).roles.highest.position >= message.member.roles.highest.position) {
        message.channel.send(lang.cmd.kick.highestRoleError)
        message.react("❌").catch(() => {}) //catch but ignore error
        return;
    }

    if (kickuser.id == bot.user.id) return message.channel.send(fn.randomstring(lang.cmd.kick.botkick))
    if (kickuser.id == message.author.id) return message.channel.send(lang.cmd.kick.selfkick)

    if (message.guild.members.cache.get(kickuser.id).roles.highest.position >= message.guild.members.cache.get(bot.user.id).roles.highest.position) {
        return message.channel.send(lang.cmd.kick.botRoleTooLow)
    }

    //Get reason if there is one provided
    var kickreason, kickreasontext = ""

    fn.getreasonfrommsg(args, ["-time", "-t", "-notify", "-n", undefined], (reason, reasontext) => {
        kickreason = reason
        kickreasontext = reasontext
    })

    //Checks user perms and kick
    if (message.member.permissions.has(Discord.Permissions.FLAGS.KICK_MEMBERS, Discord.Permissions.FLAGS.ADMINISTRATOR)) {
        message.guild.members.cache.get(kickuser.id).kick(kickreason).then(() => {
            message.channel.send(lang.cmd.kick.kickmsg.replace("username", kickuser.username).replace("kickreasontext", kickreasontext))
            message.react("✅").catch(() => {}) //catch but ignore error

            fn.msgtomodlogchannel(message.guild, "kick", message.author, kickuser, [kickreasontext, message.content.includes("-notify") || message.content.includes("-n")]) //details[1] results in boolean
            
            if (message.content.includes("-notify") || message.content.includes("-n")) {
                if (!kickuser.bot) kickuser.send(lang.cmd.kick.kicknotifymsg.replace("servername", message.guild.name).replace("kickreasontext", kickreasontext)).catch(err => {
                    message.channel.send(lang.general.dmerr + err)
                })
            }
        }).catch(err => {
            message.channel.send(`${lang.general.anerroroccurred} ${err}`)
            message.react("❌").catch(() => {}) //catch but ignore error
        })
    } else {
        message.channel.send(fn.usermissperm(lang))
    }
}

module.exports.info = {
    names: ["kick"],
    description: "cmd.kick.infodescription",
    usage: "(mention/username) [-r reason] [-notify/-n]",
    accessableby: ['moderators'],
    allowedindm: false,
    nsfwonly: false
}