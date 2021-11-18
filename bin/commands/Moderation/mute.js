/*
 * File: mute.js
 * Project: beepbot
 * Created Date: 11.02.2021 18:54:00
 * Author: 3urobeat
 * 
 * Last Modified: 18.11.2021 20:21:47
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
 * The mute command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The recieved message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    let lf = lang.cmd.mute
    
    //Check if role was successfully created by guildCreate.js (where this code is also used)
    function checkMutedRole() {
        return new Promise((resolve, reject) => {
            var mutedrole = message.guild.roles.cache.find(role => role.name == "beepBot Muted")
            var errorcount = 0

            if (!mutedrole) {
                message.guild.roles.create({
                    data: {
                        name: "beepBot Muted",
                        color: "#99AAB5",
                        permissions: [] },
                    reason: lf.rolecreatereason
                })
                    .then((role) => { //after creating role change permissions of every text channel           
                        message.guild.channels.cache.forEach((channel) => {
                            if (channel.type != "GUILD_TEXT") return;
            
                            channel.updateOverwrite(role, { SEND_MESSAGES: false, ADD_REACTIONS: false }, lf.rolechannelpermreason)
                                .catch((err) => {
                                    if (errorcount < 1) message.channel.send(`${lf.rolechannelpermerror}\n${lang.general.error}: ${err}`)
                                    errorcount++ //we don't want to spam the channel
                                    return reject();
                                })
                        })

                        resolve() //resolve promise
                    })
                    .catch((err) => { 
                        message.channel.send(`${lf.rolecreateerror}\n${lang.general.error}: ${err}`)
                        return reject();
                    })

            } else { //role seems to exist so lets check if all channels have it added to their permissions
                message.guild.channels.cache.forEach((channel) => {
                    if (channel.type != "GUILD_TEXT") return;
                    if (!channel.permissionsFor(mutedrole).has("SEND_MESSAGES") && !channel.permissionsFor(mutedrole).has("ADD_REACTIONS")) return; //if this channel already has both perms set to false then skip this iteration
    
                    channel.updateOverwrite(mutedrole, { SEND_MESSAGES: false, ADD_REACTIONS: false }, lf.rolechannelpermreason)
                        .catch((err) => {
                            if (errorcount < 1) message.channel.send(`${lf.rolechannelpermerror}\n${lang.general.error}: ${err}`)
                            errorcount++ //we don't want to spam the channel
                            return reject();
                        })
                })

                resolve() //resolve promise
            }
        })
    }

    await checkMutedRole() //call function and wait for resolved promise

    
    //Get user and do other checks
    let args0 = ["chat", "voice", "all"] //things args[0] should be
    if (!args0.includes(args[0])) return message.channel.send(lf.invalidargs.replace("prefix", guildsettings.prefix))

    var muteuser = fn.getuserfrommsg(message, args, 1, null, false, ["-r", "-n"]);
    if (!muteuser) return message.channel.send(lang.general.usernotfound)
    if (typeof (muteuser) == "number") return message.channel.send(lang.general.multipleusersfound.replace("useramount", muteuser))

    if (muteuser.id == bot.user.id) return message.channel.send(fn.randomstring(lf.botmute))
    if (muteuser.id == message.author.id) return message.channel.send(lf.selfmute)


    //Get reason if there is one provided
    var mutereason, mutereasontext = ""

    fn.getreasonfrommsg(args, ["-time", "-t", "-notify", "-n", undefined], (reason, reasontext) => {
        mutereason = reason
        mutereasontext = reasontext
    })

    
    if (args[0].toLowerCase() == "chat" || args[0].toLowerCase() == "all") {
        let mutedrole = message.guild.roles.cache.find(role => role.name == "beepBot Muted")

        if (mutedrole) {
            //Apply role
            message.guild.members.cache.get(muteuser.id).roles.add(mutedrole, mutereason)
                .catch(err => { //catch error of role adding
                    return message.channel.send(`${lf.roleadderror.replace("muteuser", muteuser.username)}\n${lang.general.error}: ${err}`)
                })
            }
        }
          
    if (args[0].toLowerCase() == "voice" || args[0].toLowerCase() == "all") {
        //Apply voicemute if muteuser is in voice chat, if not the voiceStateUpdate event in bot.js will handle muting
        if (message.guild.members.cache.get(muteuser.id).voice.channel != null) { 
            message.guild.members.cache.get(muteuser.id).voice.setMute(true, mutereason)
                .catch(err => {
                    return message.channel.send(`${lf.voicemuteerror.replace("muteuser", muteuser.username)}\n${lang.general.error}: ${err}`)
                })
        }
    }

    
    //Add timed mute to db and respond with msg
    var notifytimetext = lang.cmd.ban.permanent //needed for notify - if not permanent it will get changed by the time argument code block below (and yes just hijack the translation from the ban cmd)

    if (message.content.includes("-time") || message.content.includes("-t")) { //timed mute
        fn.gettimefrommsg(args, (timeinms, unitindex, arrcb) => { //the 3 arguments inside brackets are arguments from the callback
            if (!timeinms) return message.channel.send(lang.general.unsupportedtime.replace("timeargument", arrcb[1]))

            let timedmuteobj = {
                type: "tempmute", //used to determine what action to take by the voiceStateUpdate event
                userid: muteuser.id,
                until: Date.now() + timeinms,
                where: args[0].toLowerCase(),
                guildid: message.guild.id,
                authorid: message.author.id,
                mutereason: mutereasontext
            }

            notifytimetext = `${arrcb[0]} ${lang.general.gettimefuncoptions[unitindex]}` //change permanent to timetext

            bot.timedmutes.remove({$and: [{ userid: muteuser.id }, { guildid: message.guild.id }]}, (err) => { if (err) logger("error", "mute.js", `error removing user ${muteuser.id}: ${err}`) }) //remove an old entry if there should be one
            bot.timedmutes.insert(timedmuteobj, (err) => { if (err) logger("error", "mute.js", "error inserting user: " + err) })
            message.channel.send(lf.tempmutemsg.replace("username", muteuser.username).replace("timetext", notifytimetext).replace("mutereasontext", mutereasontext))
        })

    } else { //permanent mute
        let permmuteobj = {
            type: "permmute", //used to determine what action to take by the voiceStateUpdate event
            userid: muteuser.id,
            where: "voice",
            guildid: message.guild.id,
            authorid: message.author.id,
            mutereason: mutereasontext
        }

        bot.timedmutes.remove({$and: [{ userid: muteuser.id }, { guildid: message.guild.id }]}, (err) => { if (err) logger("error", "mute.js", `error removing user ${muteuser.id}: ${err}`) }) //remove an old entry if there should be one
        bot.timedmutes.insert(permmuteobj, (err) => { if (err) logger("error", "mute.js", "error inserting user: " + err) })
        message.channel.send(lf.permmutemsg.replace("username", muteuser.username).replace("mutereasontext", mutereasontext))
    }

    message.react("✅").catch(() => {}) //catch but ignore error
    fn.msgtomodlogchannel(message.guild, "mute", message.author, muteuser, [args[0].toLowerCase(), mutereasontext, notifytimetext, message.content.includes("-notify") || message.content.includes("-n")]) //details[2] results in boolean

    //Notify user if author provided argument
    if (message.content.includes("-notify") || message.content.includes("-n")) {
        if (!muteuser.bot) muteuser.send(lf.mutenotifymsg.replace("servername", message.guild.name).replace("mutereasontext", mutereasontext).replace("timetext", notifytimetext)).catch(err => {
            message.channel.send(lang.general.dmerror + err)
        })
    }
}

module.exports.info = {
    names: ["mute"],
    description: "cmd.mute.infodescription",
    usage: '("voice"/"chat"/"all") (mention/username) [-r reason] [-time/-t Number "seconds"/"minutes"/"hours"/"days"/"months"/"years"] [-notify/-n]',
    accessableby: ['moderators'],
    allowedindm: false,
    nsfwonly: false
}