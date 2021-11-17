/*
 * File: messageReactionAdd.js
 * Project: beepbot
 * Created Date: 07.02.2021 17:27:00
 * Author: 3urobeat
 * 
 * Last Modified: 17.11.2021 19:22:48
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


//This file contains code of the messageReactionAdd event and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

module.exports.run = (bot, logger, reaction, user) => { //eslint-disable-line
    //Fetch a reaction if it is a partial to be able to work with messages that were sent before the bot was started
    if (reaction.partial) {
        //logger("info", "messageReactionAdd.js", `Fetching a partial reaction... ID: ${reaction.message.id}`, false, true)
        reaction.fetch()
            //.then(() => { logger("info", "messageReactionAdd.js", `Successfully fetched reaction message ${reaction.message.id}.`, false, true) })
            .catch((err) => { return logger("error", "messageReactionAdd.js", `Couldn't fetch reaction message ${reaction.message.id}! Error: ${err}`) })
    }

    if (reaction.me) return; //ignore reactions by the bot itself

    bot.monitorreactions.findOne({ $and: [{msg: reaction.message.id}, {reaction: reaction._emoji.name}] }, async (err, doc) => { //id and reaction itself must match
        if (!doc) return;
        if (err) return logger("error", "messageReactionAdd.js", "Error searching in db: " + err)
        
        switch (doc.type) {
            case "modlog": //for wastebasket reaction on modlog messages
                var guildowner = await reaction.message.guild.fetchOwner();

                if (doc.allowedroles.filter(element => reaction.message.guild.members.cache.get(user.id).roles.cache.has(element)).length > 0 || user.id == guildowner.user.id) { //either user has role or is owner of guild
                    reaction.message.delete()
                        .then(() => {
                            bot.monitorreactions.remove({ reaction: reaction._emoji.name }, {}, (err) => { 
                                if (err) logger("error", "messageReactionAdd.js", `Error removing ${reaction._emoji.name} of msg ${reaction.message.id} from db after deleting msg: ${err}`)
                            })

                            return;
                        })
                        .catch(err => { reaction.message.channel.send(`Error deleting message: ${err}`)
                    }) 
                } else {
                    return;
                }

                break;

            case "createGuildlang": //for language reactions on createGuild welcome message
                var requestedlang = {}
                var requestedlangname = ""

                Object.keys(bot.langObj).every((e) => {
                    if (bot.langObj[e]["general"]["langemote"] == reaction._emoji.name) { 
                        requestedlang = bot.langObj[e]
                        requestedlangname = e
                        return false; //stops loop
                    } else {
                        return true; //continues with next iteration
                    }
                })

                //uhh this next line shouldn't trigger
                if (Object.keys(requestedlang).length == 0) return logger("warn", "messageReactionAdd.js", "I could't find a language to a createGuildlang reaction. :/ Emote: " + reaction._emoji.name)
                
                bot.channels.cache.get(doc.channelid).messages.cache.get(doc.msg).edit({
                    embeds: [{
                        title: requestedlang.general.botaddtitle,
                        description: requestedlang.general.botadddesc + requestedlang.general.botadddesc2.replace(/prefix/g, bot.constants.DEFAULTPREFIX),
                        thumbnail: { url: bot.user.displayAvatarURL() },
                        footer: {
                            text: requestedlang.general.botaddfooter 
                        } 
                    }] 
                }).then(() => {
                    reaction.users.remove(user).catch(() => {}) //catch but ignore error
                })

                //if the user didn't change the lang using the settings cmd we are still allowed to do that automatically to bring in some "magic"! (I feel like Apple rn lol)
                if (doc.enablesettingslangchange) bot.settings.update({ guildid: doc.guildid }, { $set: { lang: requestedlangname }}, {}, () => { }) //catch but ignore error
                break;
                
            default:
                return logger("error", "messageReactionAdd.js", "Invalid monitorreactions type in db! Fix this please: " + doc.type);
        }
    })
}