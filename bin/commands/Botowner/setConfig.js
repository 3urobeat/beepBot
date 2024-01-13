/*
 * File: setConfig.js
 * Project: beepbot
 * Created Date: 2021-01-19 22:36:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 13:50:13
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
 * The setconfig command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { //eslint-disable-line
    let config = bot.data.config;
    let lf     = lang.cmd.otherbotowner;

    // Code is from my Steam Comment Bot !settings cmd so I hope it doesn't look weird here - https://github.com/3urobeat/steam-comment-service-bot/blob/master/src/bot.js
    if (!args[0]) {
        fs.readFile("./bin/config.json", function(err, data) { // Use readFile to get an unprocessed object
            if (err) return logger("error", "setConfig.js", `read config values error: ${err}`);

            message.channel.send(lf.setconfigcurrentsettings + ":\n" + data.toString().slice(1, -1)); // Remove first and last character which are brackets
        });

        return;
    }

    if (!args[1]) return message.channel.send(lf.setconfigmissingargs);

    let keyvalue = config[args[0]]; // Save old value to be able to reset changes

    // I'm not proud of this code but whatever -> used to convert array into usable array
    if (Array.isArray(keyvalue)) {
        let newarr = [];

        args.forEach((e, i) => {
            if (i == 0) return; // Skip args[0]
            if (i == 1) e = e.slice(1); // Remove first char which is a [
            if (i == args.length - 1) e = e.slice(0, -1); // Remove last char which is a ]

            e = e.replace(/,/g, ""); // Remove ,

            if (e.startsWith('"')) newarr[i - 1] = String(e.replace(/"/g, ""));
                else newarr[i - 1] = Number(e);
        });

        args[1] = newarr;
    }

    // Convert to number or boolean as input is always a String
    if (typeof(keyvalue) == "number") args[1] = Number(args[1]);
    if (typeof(keyvalue) == "boolean") { // Prepare for stupid code because doing Boolean(value) will always return true
        if (args[1] == "true") args[1] = true;
        if (args[1] == "false") args[1] = false; // Could have been worse tbh
    }

    if (keyvalue == undefined) return message.channel.send(lf.setconfigcantfindkey);
    if (keyvalue == args[1])   return message.channel.send(lf.setconfigkeyalreadynewvalue.replace("configvalue", args[1]));

    config[args[0]] = args[1]; // Apply changes


    message.channel.send(lf.setconfigkeychanged.replace("configkey", `\`${args[0]}\``).replace("oldvalue", `\`${keyvalue}\``).replace("newvalue", `\`${args[1]}\``));
    logger("info", "setConfig.js", `${args[0]} has been changed from ${keyvalue} to ${args[1]}.`);

    fs.writeFile("./bin/config.json", JSON.stringify(config, null, 4), err => {
        if (err) return logger("error", "setConfig.js", `write settings cmd changes to config error: ${err}`);

        delete require.cache[require.resolve("../../config")];
        config = require("../../config.json");
    });
};

module.exports.info = { // Note to self: If you add more restrictions you need to add them to the restrictions field in the help cmd!
    names: ["setconfig"], // Array<String> with all aliases
    description: "cmd.otherbotowner.setconfiginfodescription", // Path to lang file entry (example: "cmd.othergeneral.pinginfodescription")
    usage: "[config value] [new value]",
    options: [
        {
            name: "config value",
            description: "The config key to change",
            required: false,
            type: Discord.ApplicationCommandOptionType.String
        },
        {
            name: "new value",
            description: "The new value of the key to change",
            required: false,
            type: Discord.ApplicationCommandOptionType.String
        }
    ],
    accessableby: ["botowner"], // Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false
};
