/*
 * File: message.js
 * Project: beepbot
 * Created Date: 07.02.2021 17:27:00
 * Author: 3urobeat
 * 
 * Last Modified: 18.11.2021 20:24:53
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


//This file contains code of the message event and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

const Discord = require('discord.js'); //eslint-disable-line

/**
 * The mesageCreate event (named message discord.js version <12)
 * @param {Discord.Client} bot The Discord client class
 * @param {Function} logger The logger function
 * @param {Discord.Message} message The Discord message class
 */
module.exports.run = (bot, logger, message) => { //eslint-disable-line
    //Fetch a message if it is a partial message to avoid errors
    if (message.partial) {
        //logger("info", "message.js", `Fetching a partial message in message event... ID: ${message.id}`, false, true)
        message.fetch()
            //.then(() => { logger("info", "message.js", `Successfully fetched message ${message.id}.`, false, true) })
            .catch((err) => { return logger("error", "message.js", `Couldn't fetch message ${message.id}! Error: ${err}`) })
    }

    if (message.author.bot) return;
    if (message.channel.type == "GUILD_TEXT") {
        var thisshard = message.guild.shard //Get shard instance of this shard with this "workaround" because it isn't directly accessabl
    } else {
        var thisshard = 0 //set shard id to 0 to prevent errors for example when texting in DM
    }

    //if (message.guild.id != "232550371191554051" && message.guild.id != "331822220051611648" && message.guild.id != "643117199791226880") return; //don't respond to other guilds when testing with normal loginmode (for testing)
    if (message.channel.type == "GUILD_TEXT" && bot.config.loginmode == "test") logger("info", "message.js", `Shard ${thisshard.id}: ${message}`) //log messages when testing

    //Confuse the db searching into finding nothing but not throwing an error when the channel is a dm
    if (message.channel.type == "DM") {
        var guildid = 0 //yes this isn't best practice but probably saves me from restructuring the code
    } else {
        var guildid = message.guild.id
    }

    bot.settings.findOne({ guildid: guildid }, async (err, guildsettings) => { //fetch guild data once and pass it with run function
        if (err) {
            logger("error", "message.js", "msg Event: Error fetching guild from database: " + err)
            message.channel.send("Something went wrong getting your guild's settings from the database. Please try again later.")
            return;
        }

        //Check if guild is in settings db and add it if it isn't
        if (message.channel.type !== "DM") {
            if (!guildsettings) {
                bot.fn.servertosettings(message.guild)
        
                //quickly construct guildsettings object to be able to carry on
                if (bot.config.loginmode == "normal") {
                    var prefix = bot.constants.DEFAULTPREFIX
                } else {
                    var prefix = bot.constants.DEFAULTTESTPREFIX
                }

                guildsettings = bot.constants.defaultguildsettings
                guildsettings["guildid"] = message.guild.id
                guildsettings["prefix"] = prefix

            } else {

                var changesmade = false

                Object.keys(bot.constants.defaultguildsettings).forEach((e, i) => { //check if this guild's settings is missing a key (update proofing!)
                    if (!Object.keys(guildsettings).includes(e)) { 
                        guildsettings[e] = Object.values(bot.constants.defaultguildsettings)[i]
                        changesmade = true
                    }
                })
                
                if (changesmade) bot.settings.update({ guildid: message.guild.id }, guildsettings, (err) => { if (err) logger("error", "message.js", `Error adding missing keys to ${message.guild.id}'s settings db: ${err}`) })
        } }

        //get prefix for this guild or set default prefix if channel is dm
        if (message.channel.type !== "DM") {
            var PREFIX = guildsettings.prefix 
        } else { 
            //quickly construct guildsettings object to not cause errors when using in dm
            if (bot.config.loginmode == "normal") {
                var PREFIX = bot.constants.DEFAULTPREFIX
            } else {
                var PREFIX = bot.constants.DEFAULTTESTPREFIX
            }

            guildsettings = bot.constants.defaultguildsettings
            guildsettings["guildid"] = 0
            guildsettings["prefix"] = PREFIX
        }

        if (message.content.startsWith(PREFIX)) { //check for normal prefix
            var cont = message.content.slice(PREFIX.length).split(" ");
        } else if (message.mentions.users.get(bot.user.id)) { //if no prefix given, check for mention
            var cont = message.content.slice(22).split(" "); //split off the mention <@id>

            if (cont[0] == "") var cont = cont.slice(1) //check for space between mention and command
            if (cont.toString().startsWith(PREFIX)) var cont = cont.toString().slice(PREFIX.length).split(" "); //the user even added a prefix between mention and cmd? get rid of it.
        } else { //normal message? stop.
            return;
        }

        if (!cont[0]) return; //message is empty after prefix I guess

        var args = cont.slice(1);
        var cmd  = bot.commands.get(cont[0].toLowerCase());

        if (message.channel.type === "DM") {
            if (cmd && cmd.info.allowedindm === false) return message.channel.send(bot.fn.randomstring(["That cannot work in a dm. :face_palm:","That won't work in a DM...","This command in a DM? No.","Sorry but no. Try it on a server.","You need to be on a server!"]) + " (DM-Error)")
        }

        if (cmd) { //check if command is existing and run it
            if (cmd.info.nsfwonly == true && !message.channel.nsfw) return message.channel.send(bot.fn.lang(message.guild.id, guildsettings).general.nsfwonlyerror)
            
            var ab = cmd.info.accessableby
            
            var guildowner = await message.guild.fetchOwner();

            //Check if command is allowed on this guild and respond with error message if it isn't
            if (cmd.info.allowedguilds && !cmd.info.allowedguilds.includes(message.guild.id)) return message.channel.send(bot.fn.lang(message.guild.id, guildsettings).general.guildnotallowederror);


            if (!ab.includes("all")) { //check if user is allowed to use this command
                if (ab.includes("botowner")) {
                    if (message.author.id !== '231827708198256642') return message.channel.send(bot.fn.owneronlyerror(bot.fn.lang(message.guild.id, guildsettings)))
                } else if (guildowner && message.author.id == guildowner.user.id) { //check if owner property is accessible otherwise skip this step. This can be null because of Discord's privacy perms but will definitely be not null should the guild owner be the msg author and only then this step is even of use
                    //nothing to do here, just not returning an error message and let the server owner do what he wants
                } else if (ab.includes("admins")) {
                    if (!guildsettings.adminroles.filter(element => message.member.roles.cache.has(element)).length > 0) return message.channel.send(bot.fn.usermissperm(bot.fn.lang(message.guild.id, guildsettings)))
                } else if (ab.includes("moderators")) {
                    //check if user doesn't have admin nor modrole because admins should be able to execute mod commands
                    if (!guildsettings.moderatorroles.filter(element => message.member.roles.cache.has(element)).length > 0 && !guildsettings.adminroles.filter(element => message.member.roles.cache.has(element)).length > 0) {
                        return message.channel.send(bot.fn.usermissperm(bot.fn.lang(message.guild.id, guildsettings)))
                    }
                } else {
                    message.channel.send(`This command seems to have an invalid restriction setting. I'll have to stop the execution of this command to prevent safety issues.\n${BOTOWNER} will probably see this error and fix it.`) //eslint-disable-line no-undef
                    logger('error', 'message.js', `The command restriction \x1b[31m'${ab}'\x1b[0m is invalid. Stopping the execution of the command \x1b[31m'${cont[0]}'\x1b[0m to prevent safety issues.`)
                    return;
                }
            }

            if (message.channel.type === "DM") {
                cmd.run(bot, message, args, bot.langObj["english"], logger, guildsettings, bot.fn)
            } else {
                require("fs").appendFile("./bin/cmduse.txt", `[${(new Date(Date.now() - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, ' ').replace(/\..+/, '')}] (Guild ${message.guild.id}) ${message.content}\n`, () => {}) //add cmd usage to cmduse.txt
                cmd.run(bot, message, args, bot.fn.lang(message.guild.id, guildsettings), logger, guildsettings, bot.fn) //run the command after lang function callback
            }
            
            return;
        } else { //cmd not recognized? check if channel is dm and send error message
            if (message.channel.type === "DM") {
                message.channel.send(bot.fn.randomstring(["Invalid command! :neutral_face:","You got something wrong there!","Something is wrong... :thinking:","Whoops - it seems like this command doesn't exists.","Trust me. Something is wrong with your command.","That is not right."]) + " (Wrong command-Error)")
            }

            return;
        }
    })
}