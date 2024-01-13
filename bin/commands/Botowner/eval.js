/*
 * File: eval.js
 * Project: beepbot
 * Created Date: 2020-10-04 18:10:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-09 22:39:30
 * Modified By: 3urobeat
 *
 * Copyright (c) 2020 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const util = require("util");
const Discord = require("discord.js"); // eslint-disable-line

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The eval command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    const clean = (text) => {
        if (typeof(text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else return text;
    };

    try {
        const code = args.join(" ");
        let evaled = eval(code);

        if (typeof evaled !== "string")
        evaled = util.inspect(evaled);

        message.channel.send(clean(evaled), { code:"xl" }).catch(err => {
            message.channel.send("Error: " + err);
        });

    } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        message.react("❌").catch(() => { }); // Catch but ignore error
        return;
    }

    message.react("✅").catch(() => { }); // Catch but ignore error
};

module.exports.info = {
    names: ["eval"],
    description: "cmd.otherbotowner.evalinfodescription",
    usage: "(javascript code)",
    options: [
        {
            name: "javascript-code",
            description: "JavaScript Code that will be executed",
            required: true,
            type: Discord.ApplicationCommandOptionType.String
        }
    ],
    accessableby: ["botowner"],
    allowedindm: true,
    nsfwonly: false
};
