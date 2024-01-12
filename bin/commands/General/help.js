/*
 * File: help.js
 * Project: beepbot
 * Created Date: 2020-10-04 18:10:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-12 08:58:52
 * Modified By: 3urobeat
 *
 * Copyright (c) 2020 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js"); // eslint-disable-line
const lodash  = require("lodash");

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The help command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    let lf = lang.cmd.help; // Lf for lang-file

    // Process first argument
    if (!args[0]) args[0] = "";
        else args[0].replace(guildsettings.prefix, ""); // Remove prefix from argument if the user should have provided one

    // Helper function to replace boolean in string with emote
    let replaceBool = (value) => {
        return String(value).replace("true", "✅").replace("false", "❌");
    };

    if (args[0]) { // User wants detailed information to one command?
        let cmd = bot.data.commands.get(args[0].toLowerCase());

        if (cmd) {
            let cmdaliases = [lf.noaliases];

            if (cmd.info.names.length > 1) cmdaliases = cmd.info.names.filter((_, i) => i !== 0); // Remove first entry - Credit: https://stackoverflow.com/a/27396779/12934162

            message.channel.send({
                embeds: [{
                    title: `${lf.help} - ${cmd.info.names[0]}`,
                    color: bot.misc.randomHex(),
                    description: `${lodash.get(lang, cmd.info.description)}`, // Lodash is able to replace the obj path in the str with the corresponding item in the real obj. Very cool!,
                    fields: [{
                        name: `${lf.aliases}:`,
                        value: cmdaliases.join(", "),
                        inline: true
                    },
                    {
                        name: `${lf.category}:`,
                        value: cmd.info.category,
                        inline: true
                    },
                    {
                        name: `${lf.usage}:`,
                        value: `\`${guildsettings.prefix}${cmd.info.names[0]} ${cmd.info.usage}\`\n\n*[] <- ${lf.optionalargument}, () <- ${lf.requiredargument}*`
                    },
                    {
                        name: `${lf.restrictions}:`,
                        value: `${lf.cmdaccessableby}: ${String(cmd.info.accessableby).replace("all", lf.cmdaccessablebyall)}
                                ${lf.cmdallowedindm}: ${replaceBool(cmd.info.allowedindm)}
                                ${lf.cmdnsfwonly}: ${replaceBool(cmd.info.nsfwonly)}`
                    }],
                    footer: {
                        icon_url: message.author.displayAvatarURL(), // eslint-disable-line camelcase
                        text: `${lang.general.requestedby} ${message.author.displayName} • ${lf.setrestrictionsinsettings}: ${guildsettings.prefix}settings`
                    }
                }]
            });
        } else {
            return message.channel.send(lf.cmdnotfound);
        }

    } else { // No argument given, construct full list of commands

        let msg = {};
        let commandsObj = [...bot.data.commands.values()];
        let unsortedcategories = {};
        let sortedcategories = {};
        let commandcount = 0;

        // Pre-configure message
        msg = {
            embeds: [{
                title: `${lf.help} - ${lf.commandlist}`,
                color: bot.misc.randomHex(),
                thumbnail: { url: bot.client.user.avatarURL() },
                fields: [],
                footer: {
                    icon_url: message.author.displayAvatarURL(), // eslint-disable-line camelcase
                    text: `${lang.general.requestedby} ${message.author.displayName}`
                },
                timestamp: new Date().toISOString()
            }]
        };

        // Get all unsortedcategories into array
        commandsObj.forEach(e => {
            // Check if cmd is test and ignore it
            if (e.info.names[0] == "test") return;

            // Check if category is Botowner and ignore it if the user shouldn't be me (just to keep the msg shorter/more relevant)
            if (e.info.category == "Botowner" && message.author.id !== "231827708198256642") return;

            // Check if command is allowed on this guild and hide it if it isn't
            if (e.info.allowedguilds && !e.info.allowedguilds.includes(message.guild.id)) return;

            // Check if command is nsfwonly and hide it if guild has nsfw commands disabled
            if (e.info.nsfwonly && !guildsettings.allownsfw) return;

            // Create new Array for category if it doesn't exist yet
            if (!unsortedcategories[e.info.category]) unsortedcategories[e.info.category] = [];

            // Check if this iteration is an alias cmd by checking this value that was added in the cmd reading process
            if (e.info.thisisanalias == true) return;

            // Count!
            commandcount++;

            // Add command to existing Category Array
            unsortedcategories[e.info.category].push(`\`${guildsettings.prefix}${e.info.names[0]}\` - ${lodash.get(lang, e.info.description)}`); // Lodash is able to replace the obj path in the str with the corresponding item in the real obj. Very cool!
        });

        // Put counted commands into description
        msg.embeds[0].description = `__${lf.overviewofxcmds.replace("commandcount", `**${commandcount}**`)}__:\n${lf.detailedcommandinfo.replace("prefix", guildsettings.prefix)}`;

        // Sort Object by order defined in config
        bot.data.config.helpcategoryorder.forEach((e) => {
            if (e == "other") { // Check if this key is the key for all categories with no specific order
                Object.keys(unsortedcategories).forEach((k) => { // Loop over all categories
                    if (!bot.data.config.helpcategoryorder.includes(k)) { // Check if this is one of the categories with no specific order
                        sortedcategories[k] = unsortedcategories[k]; // Just add it
                    }
                });
            } else {
                // Check if category is Botowner and ignore it if the user shouldn't be me (just to keep the msg shorter/more relevant)
                if (e == "Botowner" && message.author.id !== "231827708198256642") return;

                sortedcategories[e] = unsortedcategories[e]; // Add Category to Object
            }
        });

        // Add sortedcategories with commands to msg
        Object.keys(sortedcategories).forEach((e) => {
            let categorytitle = lf[e.toLowerCase()]; // Get translated category name from language file
            if (!categorytitle) categorytitle = e; // If language file doesn't have this category just use the "raw" name

            msg.embeds[0].fields.push({
                name: categorytitle,
                value: sortedcategories[e].join("\n") // The dynamically created value array must be converted back to a String so we join them with a line break in order that the commands are listed below eachother
            });
        });

        // Finally send message
        message.channel.send(msg);
    }
};

module.exports.info = {
    names: ["help", "h", "commands"],
    description: "cmd.help.infodescription",
    usage: "[command name]",
    options: [
        {
            name: "command-name",
            description: "Povide a command name to get detailed information about this command",
            required: false,
            type: Discord.ApplicationCommandOptionType.String
        }
    ],
    accessableby: ["all"],
    allowedindm: true,
    nsfwonly: false
};
