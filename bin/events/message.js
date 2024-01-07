/*
 * File: message.js
 * Project: beepbot
 * Created Date: 2021-02-07 17:27:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-07 19:41:12
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// This event handler handles the legacy way of using commands.
// We can still support this method because we've got the messageContent intent approved for the *movemsg command.

const Discord = require("discord.js");

const Bot = require("../bot.js");


/**
 * Handles discord.js's message (renamed to messageCreate) event of this shard
 */
Bot.prototype._attachDiscordMessageEvent = function() {

    this.client.on("messageCreate", (message) => {

        // Fetch a message if it is a partial message to avoid errors
        if (message.partial) {
            // Logger("info", "message.js", `Fetching a partial message in message event... ID: ${message.id}`, false, true)
            message.fetch()
                // .then(() => { logger("info", "message.js", `Successfully fetched message ${message.id}.`, false, true) })
                .catch((err) => { return logger("error", "message.js", `Couldn't fetch message ${message.id}! Error: ${err}`); });
        }

        if (message.author.bot) return;

        // Get shard id
        let thisshard = 0; // Set shard id to 0 to prevent errors for example when texting in DM

        if (message.channel.type == Discord.ChannelType.GuildText) {
            thisshard = message.guild.shard; // Get shard instance of this shard with this "workaround" because it isn't directly accessabl
        }

        // If (message.guild.id != "232550371191554051" && message.guild.id != "331822220051611648" && message.guild.id != "643117199791226880") return; //don't respond to other guilds when testing with normal loginmode (for testing)
        if (message.channel.type == Discord.ChannelType.GuildText && this.data.config.loginmode == "test") logger("info", "message.js", `Shard ${thisshard.id}: ${message.content}`); // Log messages when testing

        // Confuse the db searching into finding nothing but not throwing an error when the channel is a dm
        let guildID = 0;

        if (message.channel.type != Discord.ChannelType.DM) guildID = message.guild.id;

        this.data.settings.findOne({ guildid: guildID }, async (err, guildsettings) => { // Fetch guild data once and pass it with run function
            if (err) {
                logger("error", "message.js", "msg Event: Error fetching guild from database: " + err);
                message.channel.send("Something went wrong getting your guild's settings from the database. Please try again later.");
                return;
            }

            // Check if guild is in settings db and add it if it isn't
            if (message.channel.type !== "DM") {
                if (!guildsettings) {
                    bot.fn.servertosettings(message.guild);

                    // Quickly construct guildsettings object to be able to carry on
                    let prefix = this.data.constants.DEFAULTPREFIX;

                    if (this.data.config.loginmode == "test") {
                        prefix = this.data.constants.DEFAULTTESTPREFIX;
                    }

                    guildsettings = this.data.constants.defaultguildsettings;
                    guildsettings["guildid"] = message.guild.id;
                    guildsettings["prefix"] = prefix;

                } else {

                    let changesmade = false;

                    Object.keys(this.data.constants.defaultguildsettings).forEach((e, i) => { // Check if this guild's settings is missing a key (update proofing!)
                        if (!Object.keys(guildsettings).includes(e)) {
                            guildsettings[e] = Object.values(this.data.constants.defaultguildsettings)[i];
                            changesmade = true;
                        }
                    });

                    if (changesmade) this.data.settings.update({ guildid: message.guild.id }, guildsettings, (err) => { if (err) logger("error", "message.js", `Error adding missing keys to ${message.guild.id}'s settings db: ${err}`); });
                }

                // Call levelUser helper
                require("../functions/levelUser.js").levelUser(bot, logger, message.author, message.guild, message.channel, bot.fn.lang(message.guild.id, guildsettings), guildsettings);
            }


            // Get prefix for this guild or set default prefix if channel is dm
            let PREFIX = guildsettings.prefix;

            if (message.channel.type == "DM") {
                // Quickly construct guildsettings object to not cause errors when using in dm
                PREFIX = this.data.constants.DEFAULTPREFIX;

                if (this.data.config.loginmode == "test") {
                    PREFIX = this.data.constants.DEFAULTTESTPREFIX;
                }

                guildsettings = bot.constants.defaultguildsettings;
                guildsettings["guildid"] = 0;
                guildsettings["prefix"] = PREFIX;
            }


            // Get message content
            let cont;

            if (message.content.startsWith(PREFIX)) { // Check for normal prefix
                cont = message.content.slice(PREFIX.length).split(" ");

            } else if (message.mentions.users.get(this.client.user.id)) { // If no prefix given, check for mention
                cont = message.content.slice(22).split(" "); // Split off the mention <@id>

                if (cont[0] == "") cont = cont.slice(1); // Check for space between mention and command
                if (cont.toString().startsWith(PREFIX)) cont = cont.toString().slice(PREFIX.length).split(" "); // The user even added a prefix between mention and cmd? get rid of it.

            } else { // Normal message? stop.
                return;
            }

            if (!cont[0]) return; // Message is empty after prefix I guess


            // Process content
            let args = cont.slice(1);
            let cmd  = this.data.commands.get(cont[0].toLowerCase());

            if (message.channel.type === "DM") {
                if (cmd && cmd.info.allowedindm === false) return message.channel.send(bot.fn.randomstring(["That cannot work in a dm. :face_palm:", "That won't work in a DM...", "This command in a DM? No.", "Sorry but no. Try it on a server.", "You need to be on a server!"]) + " (DM-Error)");
            }

            if (cmd) { // Check if command is existing and run it
                if (cmd.info.nsfwonly == true && !message.channel.nsfw) return message.channel.send(bot.fn.lang(message.guild.id, guildsettings).general.nsfwonlyerror);

                let ab = cmd.info.accessableby;

                let guildowner = await message.guild.fetchOwner();

                // Check if command is allowed on this guild and respond with error message if it isn't
                if (cmd.info.allowedguilds && !cmd.info.allowedguilds.includes(message.guild.id)) return message.channel.send(bot.fn.lang(message.guild.id, guildsettings).general.guildnotallowederror);

                // Check if server admins disabled nsfw commands
                if (cmd.info.nsfwonly && !guildsettings.allownsfw) return message.channel.send(bot.fn.lang(message.guild.id, guildsettings).general.allownsfwdisablederror);


                if (!ab.includes("all")) { // Check if user is allowed to use this command
                    if (ab.includes("botowner")) {
                        if (message.author.id !== "231827708198256642") return message.channel.send(bot.fn.owneronlyerror(bot.fn.lang(message.guild.id, guildsettings)));
                    } else if (guildowner && message.author.id == guildowner.user.id) { // Check if owner property is accessible otherwise skip this step. This can be null because of Discord's privacy perms but will definitely be not null should the guild owner be the msg author and only then this step is even of use
                        // Nothing to do here, just not returning an error message and let the server owner do what he wants
                    } else if (ab.includes("admins")) {
                        if (!guildsettings.adminroles.filter(element => message.member.roles.cache.has(element)).length > 0) return message.channel.send(bot.fn.usermissperm(bot.fn.lang(message.guild.id, guildsettings)));
                    } else if (ab.includes("moderators")) {
                        // Check if user doesn't have admin nor modrole because admins should be able to execute mod commands
                        if (!guildsettings.moderatorroles.filter((e) => message.member.roles.cache.has(e)).length > 0 && !guildsettings.adminroles.filter((e) => message.member.roles.cache.has(e)).length > 0) {
                            return message.channel.send(bot.fn.usermissperm(bot.fn.lang(message.guild.id, guildsettings)));
                        }
                    } else {
                        message.channel.send(`This command seems to have an invalid restriction setting. I'll have to stop the execution of this command to prevent safety issues.\n${BOTOWNER} will probably see this error and fix it.`); // eslint-disable-line no-undef
                        logger("error", "message.js", `The command restriction \x1b[31m'${ab}'\x1b[0m is invalid. Stopping the execution of the command \x1b[31m'${cont[0]}'\x1b[0m to prevent safety issues.`);
                        return;
                    }
                }

                if (message.channel.type === "DM") {
                    cmd.run(bot, message, args, this.data.langObj["english"], logger, guildsettings, bot.fn);
                } else {
                    this.data.appendToCmdUse(`(Guild ${message.guild.id}) ${message.content}`); // Add cmd usage to cmduse.txt
                    cmd.run(bot, message, args, bot.fn.lang(message.guild.id, guildsettings), logger, guildsettings, bot.fn); // Run the command after lang function callback
                }

                return;
            } else { // Cmd not recognized? check if channel is dm and send error message
                if (message.channel.type === "DM") {
                    message.channel.send(bot.fn.randomstring(["Invalid command! :neutral_face:", "You got something wrong there!", "Something is wrong... :thinking:", "Whoops - it seems like this command doesn't exists.", "Trust me. Something is wrong with your command.", "That is not right."]) + " (Wrong command-Error)");
                }

                return;
            }
        });

    });

};
