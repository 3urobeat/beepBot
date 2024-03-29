/*
 * File: setPresence.js
 * Project: beepbot
 * Created Date: 2021-01-09 21:11:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 13:50:31
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const fs = require("fs");
const Discord = require("discord.js"); // eslint-disable-line

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The setpresence command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    let lf = lang.cmd.otherbotowner;
    // Note: Gametype must be caps

    if (!args[0]) return message.channel.send(lf.setpresencemissingargs);

    if (args[0].toLowerCase() == "remove" || args[0].toLowerCase() == "default") { // Reset presence settings to default and stop
        bot.data.config.status        = bot.data.constants.DEFAULTSTATUS;
        bot.data.config.gametype      = bot.data.constants.DEFAULTGAMETYPE;
        bot.data.config.gameoverwrite = "";
        bot.data.config.gameurl       = bot.data.constants.DEFAULTGAMEURL;

        fs.writeFile("./bin/config.json", JSON.stringify(bot.data.config, null, 4), (err) => {
            if (err) logger("error", "setPresence.js", "Error writing changes to config: " + err);
        });

        bot.client.shard.broadcastEval((client, context) => {
            client.user.setPresence({
                activities: [{
                    name: context.config.gamerotation[0],
                    type: context.constants.gametypetranslation[context.config.gametype],
                    url: context.config.gameurl
                }],
                status: context.config.status
            })
                .then(() => {
                    message.channel.send(lf.setpresenceupdated);
                })
                .catch(err => { // Error will occur when not all shards are started yet
                    logger("warn", "setPresence.js", "Couldn't set presence: " + err.stack);
                });
        }, { context: { config: bot.data.config, constants: bot.data.constants } });

    } else {

        let possibleflags = ["-s", "-gt", "-g", "-url"];

        let newstatus = args.indexOf("-s");
        let newgametype = args.indexOf("-gt");
        let newgame = args.indexOf("-g");
        let newurl = args.indexOf("-url");

        if (newstatus != "-1") {
            if (!["online", "idle", "dnd", "invisible"].includes(args[newstatus + 1].toLowerCase())) {
                return message.channel.send(`${lf.setpresenceinvalidstatus} 'online', 'idle', 'dnd', 'invisible'`);
            }

            bot.data.config.status = args[newstatus + 1].toLowerCase();
        }

        if (newgametype != "-1") {
            if (!["PLAYING", "STREAMING", "LISTENING", "WATCHING", "COMPETING"].includes(args[newgametype + 1].toUpperCase())) {
                return message.channel.send(`${lf.setpresenceinvalidgametype} 'playing', 'streaming', 'listening', 'watching', 'competing'`);
            }

            bot.data.config.gametype = args[newgametype + 1].toUpperCase(); // Must be caps
        }

        if (newgame != "-1") {
            if (args[newgame + 1] == "default") { // Default will just remove gameoverwrite but keep any other setting
                bot.data.config.gameoverwrite = "";
                newgame = bot.data.config.gamerotation[0];
            } else {
                // Join arguments until next dash (idk if there is a function that does that so I'm just gonna do it myself real quick)
                let index = Number(newgame) + 1; // +1 since we aren't interested in the argument flag field
                newgame = "";

                for (let i = 0; i < args.length; i++) {
                    newgame += `${args[index]} `;
                    index++;

                    // Index is now +1 and args[index] points therefore to the next field. If the next field is one of the possible flags or doesn't exist we stop as this must be the end of this arg
                    if (possibleflags.includes(args[index]) || !args[index]) {
                        bot.data.config.gameoverwrite = newgame;
                        break;
                    }
                }
            }
        } else {
            newgame = bot.client.user.presence.activities[0].name; // Just set it to current game
        }

        if (newurl != "-1") {
            if (args[newurl + 1] == "default") bot.data.config.gameurl = bot.data.constants.DEFAULTGAMEURL;
                else bot.data.config.gameurl = args[newurl + 1]; // Url shouldn't contain a space
        }

        // Write and broadcast changes
        fs.writeFile("./bin/config.json", JSON.stringify(bot.data.config, null, 4), (err) => {
            if (err) logger("error", "setPresence.js", "Error writing changes to config: " + err);
        });

        bot.client.shard.broadcastEval((client, context) => {
            client.user.setPresence({
                activities: [{
                    name: newgame,
                    type: context.constants.gametypetranslation[context.config.gametype],
                    url: context.config.gameurl
                }],
                status: context.config.status
            })
                .then(() => {
                    message.channel.send(lf.setpresenceupdated);
                })
                .catch(err => { // Error will occur when not all shards are started yet
                    logger("warn", "setPresence.js", "Couldn't set presence: " + err.stack);
                });
        }), { context: { config: bot.data.config, constants: bot.data.constants } };
    }
};

module.exports.info = { // Note to self: If you add more restrictions you need to add them to the restrictions field in the help cmd!
    names: ["setpresence"],
    description: "cmd.otherbotowner.setpresenceinfodescription",
    usage: "['remove'/'default'] [-s 'online'/'idle'/'dnd'/'invisible'] [-gt 'playing'/'streaming'/'listening'/'watching'/'competing'] [-g gametext/'default'] [-url Stream URL/'default']",
    options: [
        {
            name: "preset",
            description: "Removes current status or loads default status settings",
            required: false,
            type: Discord.ApplicationCommandOptionType.String,
            choices: [
                { name: "Remove current status", value: "remove" },
                { name: "Load default status settings", value: "default" }
            ]
        },
        {
            name: "status",
            description: "Sets an online status",
            required: false,
            type: Discord.ApplicationCommandOptionType.String,
            choices: [
                { name: "Select status online", value: "online" },
                { name: "Select status idle", value: "idle" },
                { name: "Select status do-not-disturb", value: "dnd" },
                { name: "Select status invisible", value: "invisible" }
            ],
            prefix: "-s"
        },
        {
            name: "gametype",
            description: "Sets a game type",
            required: false,
            type: Discord.ApplicationCommandOptionType.String,
            choices: [
                { name: "Select gametype playing", value: "playing" },
                { name: "Select gametype streaming", value: "streaming" },
                { name: "Select gametype listening", value: "listening" },
                { name: "Select gametype watching", value: "watching" },
                { name: "Select gametype competing", value: "competing" }
            ],
            prefix: "-gt"
        },
        {
            name: "gametext",
            description: "Set a custom game text or type 'default' to load default text",
            required: false,
            type: Discord.ApplicationCommandOptionType.String,
            prefix: "-g"
        },
        {
            name: "url",
            description: "Set a custom stream url or type 'default' to load default url",
            required: false,
            type: Discord.ApplicationCommandOptionType.String,
            prefix: "-url"
        }
    ],
    accessableby: ["botowner"], // Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false
};
