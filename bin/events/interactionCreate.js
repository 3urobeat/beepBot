/*
 * File: interactionCreate.js
 * Project: beepbot
 * Created Date: 2022-01-13 13:20:08
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-05 23:26:06
 * Modified By: 3urobeat
 *
 * Copyright (c) 2022 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require('discord.js'); //eslint-disable-line

/**
 * The interactionCreate event
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Interaction} interaction The interaction which was created
 */
module.exports.run = async (bot, logger, interaction) => { //eslint-disable-line

    // Set thisshard if in guild otherwise set 0
    if (interaction.inGuild()) var thisshard = interaction.guild.shard;
        else var thisshard = { id: 0 };

    // Get guildsettings from db
    if (interaction.inGuild()) var guildid = interaction.guild.id;
        else var guildid = 0;

    bot.settings.findOne({ guildid: guildid }, async (err, guildsettings) => {
        if (err) {
            logger("error", "message.js", "msg Event: Error fetching guild from database: " + err);
            interaction.reply({ content: "Something went wrong getting your guild's settings from the database. Please try again later.", ephemeral: true });
            return;
        }

        // Check if guild is in settings db and add it if it isn't
        if (interaction.inGuild()) {
            if (!guildsettings) {
                bot.fn.servertosettings(interaction.guild);

                // Quickly construct guildsettings object to be able to carry on
                if (bot.config.loginmode == "normal") var prefix = bot.constants.DEFAULTPREFIX;
                    else var prefix = bot.constants.DEFAULTTESTPREFIX;

                guildsettings = bot.constants.defaultguildsettings;
                guildsettings["guildid"] = guildid;
                guildsettings["prefix"] = prefix;

            } else {

                let changesmade = false;

                Object.keys(bot.constants.defaultguildsettings).forEach((e, i) => { // Check if this guild's settings is missing a key (update proofing!)
                    if (!Object.keys(guildsettings).includes(e)) {
                        guildsettings[e] = Object.values(bot.constants.defaultguildsettings)[i];
                        changesmade = true;
                    }
                });

                if (changesmade) bot.settings.update({ guildid: guildid }, guildsettings, (err) => { if (err) logger("error", "message.js", `Error adding missing keys to ${guildid}'s settings db: ${err}`); });
            }

            // Call levelUser helper
            require("../functions/levelUser.js").levelUser(bot, logger, interaction.member.user, interaction.guild, interaction.channel, bot.fn.lang(guildid, guildsettings), guildsettings);
        }

        // Check if this is a command first or another general interaction
        if (interaction.type == Discord.InteractionType.ApplicationCommand) {

            // Get command
            let cmd = bot.commands.get(interaction.commandName);

            // Create old styled args array (I should implement the new way of getting arguments using an obj to make using them easier, however I didn't find a nice way to make it compatible with the old message event which I would like to keep active)
            // var args = {}; //these two lines would be how to map the new obj easily
            // interaction.options.data.map((e) => args[e.name] = e.value )

            let args = [];

            interaction.options.data.forEach((e) => {
                if (typeof(e.value) == "boolean" && !e.value) return; // Check if value is a boolean and set to false and don't include it (as for example -n false would still trigger notify code execution as it only checks for the param -n, not for the following value)

                // Check if this option has a prefix that is normally included in the args array when coming from the normal messageCreate event and push it first
                let optionprefix = cmd.info.options.filter(f => f.name == e.name)[0]["prefix"];
                if (optionprefix) args.push(optionprefix);

                args.push(String(e.value));
            });

            // Log interaction when in testing mode
            if (bot.config.loginmode == "test") logger("info", "interactionCreate.js", `Shard ${thisshard.id}: Interaction with /${interaction.commandName} ${args.join(" ")}`);

            // Check for restrictions and stuff
            if (cmd) {
                if (!interaction.inGuild() && !cmd.info.allowedindm) return interaction.reply(bot.fn.randomstring(["That cannot work in a dm. :face_palm:", "That won't work in a DM...", "This command in a DM? No.", "Sorry but no. Try it on a server.", "You need to be on a server!"]) + " (DM-Error)");

                if (cmd.info.nsfwonly == true && !interaction.channel.nsfw) return interaction.reply(bot.fn.lang(interaction.guild.id, guildsettings).general.nsfwonlyerror);

                // Check if user is allowed to use this command
                let ab = cmd.info.accessableby;

                let guildowner = await interaction.guild.fetchOwner();

                // Check if command is allowed on this guild and respond with error message if it isn't
                if (cmd.info.allowedguilds && !cmd.info.allowedguilds.includes(interaction.guild.id)) return interaction.reply(bot.fn.lang(interaction.guild.id, guildsettings).general.guildnotallowederror);

                // Check if server admins disabled nsfw commands
                if (cmd.info.nsfwonly && !guildsettings.allownsfw) return interaction.reply(bot.fn.lang(interaction.guild.id, guildsettings).general.allownsfwdisablederror);


                if (!ab.includes("all")) { // Check if user is allowed to use this command
                    if (ab.includes("botowner")) {
                        if (interaction.member.user.id !== "231827708198256642") return interaction.reply(bot.fn.owneronlyerror(bot.fn.lang(interaction.guild.id, guildsettings)));
                    } else if (guildowner && interaction.member.user.id == guildowner.user.id) { // Check if owner property is accessible otherwise skip this step. This can be null because of Discord's privacy perms but will definitely be not null should the guild owner be the msg author and only then this step is even of use
                        // Nothing to do here, just not returning an error message and let the server owner do what he wants
                    } else if (ab.includes("admins")) {
                        if (!guildsettings.adminroles.filter(element => interaction.member.roles.cache.has(element)).length > 0) return interaction.reply(bot.fn.usermissperm(bot.fn.lang(interaction.guild.id, guildsettings)));
                    } else if (ab.includes("moderators")) {
                        // Check if user doesn't have admin nor modrole because admins should be able to execute mod commands
                        if (!guildsettings.moderatorroles.filter(element => interaction.member.roles.cache.has(element)).length > 0 && !guildsettings.adminroles.filter(element => interaction.member.roles.cache.has(element)).length > 0) {
                            return interaction.reply(bot.fn.usermissperm(bot.fn.lang(interaction.guild.id, guildsettings)));
                        }
                    } else {
                        interaction.reply(`This command seems to have an invalid restriction setting. I'll have to stop the execution of this command to prevent safety issues.\n${BOTOWNER} will probably see this error and fix it.`); // eslint-disable-line no-undef
                        logger("error", "message.js", `The command restriction \x1b[31m'${ab}'\x1b[0m is invalid. Stopping the execution of the command \x1b[31m'${interaction.commandName}'\x1b[0m to prevent safety issues.`);
                        return;
                    }
                }

                interaction.deferReply(); // For now I'm going to defer instantly so that I don't need to revamp *every* channel.send() call. If I implement slash commands better in the future, this will be optimized.

                interaction["author"] = interaction.member.user; // Add author field with slight workaround to provide compatibility with message object
                interaction["react"]  = () => { return new Promise(() => { });}; // Prevent error by doing nothing when calling react() as we can't react to an interaction

                if (!interaction.inGuild()) {
                    cmd.run(bot, interaction, args, bot.langObj["english"], logger, guildsettings, bot.fn);
                } else {
                    require("fs").appendFile("./bin/cmduse.txt", `[${(new Date(Date.now() - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, " ").replace(/\..+/, "")}] (Guild ${interaction.guild.id}) /${interaction.commandName} ${args.join(" ")}\n`, () => {}); // Add cmd usage to cmduse.txt
                    cmd.run(bot, interaction, args, bot.fn.lang(interaction.guild.id, guildsettings), logger, guildsettings, bot.fn); // Run the command after lang function callback
                }
            }

        } else {

            // Log interaction when in testing mode
            if (bot.config.loginmode == "test") logger("info", "interactionCreate.js", `Shard ${thisshard.id}: General interaction with id ${interaction.customId}`);

            switch (interaction.customId) {
                case "welcomeLang":
                    if (!interaction.isSelectMenu()) return;

                    if (!interaction.memberPermissions.has(Discord.PermissionFlagsBits.ManageMessages)) return interaction.reply({ ephemeral: true, content: "Only members with 'Manage Messages' permission are allowed to change the language of this message." }); // Don't let every user interact to prevent a bit of chaos
                    if (interaction.message.createdTimestamp + 7200000 < Date.now()) return interaction.reply({ ephemeral: true, content: "Changing the language of the welcome message is disabled after 2 hours to prevent users from changing the server's language.\nIf you are an admin please use the `settings` command instead to change the language of this server." });

                    var requestedlang = bot.langObj[interaction.values[0]];

                    // Construct menu again in order to be able to update the placeholder (I just couldn't find a better way yet and interaction.update always reset the user's choice)
                    var langArray = [];

                    Object.values(bot.langObj).forEach((e, i) => { // Push each language to the array
                        langArray.push({
                            label: e.general.thislang,
                            emoji: e.general.langemote,
                            value: Object.keys(bot.langObj)[i]
                        });
                    });

                    var langComponents = [
                        new Discord.ActionRowBuilder()
                            .addComponents(
                                new Discord.SelectMenuBuilder()
                                    .setCustomId("welcomeLang")
                                    .setPlaceholder(`${requestedlang.general.langemote} ${requestedlang.general.botaddchooselang}`)
                                    .addOptions(langArray)
                            )
                    ];

                    // Update message with new language
                    interaction.update({
                        embeds: [{
                            title: requestedlang.general.botaddtitle,
                            description: requestedlang.general.botadddesc + requestedlang.general.botadddesc2.replace(/prefix/g, bot.constants.DEFAULTPREFIX) + requestedlang.general.botadddesc3.replace(/prefix/g, bot.constants.DEFAULTPREFIX),
                            thumbnail: { url: bot.user.displayAvatarURL() }
                        }],
                        components: langComponents
                    });

                    // Update guilds language as well
                    bot.settings.update({ guildid: interaction.guild.id }, { $set: { lang: interaction.values[0] }}, {}, () => { }); // Catch but ignore error
                    break;

                // Wastebucket button on modlog messages that should delete the message
                case "modlogMessageDeleteButton":

                    // Check if user is allowed to use this button (admin or the guild owner)
                    if (guildsettings.adminroles.filter(element => interaction.member.roles.cache.has(element)).length > 0 || interaction.user.id == interaction.guild.ownerId) { // Either user has role or is owner of guild
                        interaction.message.delete()
                            .catch(err => interaction.reply({ content: `Error deleting message: ${err}`, ephemeral: true }));

                    } else {

                        // Send ephermal missing permissions error message
                        interaction.reply({ content: bot.fn.usermissperm(bot.fn.lang(interaction.guild.id, guildsettings)), ephemeral: true });

                        return;
                    }

                    break;

                default:
                    return logger("error", "interactionCreate.js", "Invalid interaction ID received: " + interaction.customId);
            }
        }
    });

};
