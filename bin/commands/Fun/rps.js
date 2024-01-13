/*
 * File: rps.js
 * Project: beepbot
 * Created Date: 2021-01-09 21:11:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-11 16:28:59
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js"); // eslint-disable-line

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The rps command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line

    let sendresponse = (wordarr, decision, result) => {
        if (wordarr[0] == decision[0]) return message.channel.send(`${wordarr[1]} vs ${decision[1]}\n${lang.cmd.otherfun.rpstie}`);

        if (result == "win") return message.channel.send(`${wordarr[1]} vs ${decision[1]}\n${lang.cmd.otherfun.rpswin}`);
            else return message.channel.send(`${wordarr[1]} vs ${decision[1]}\n${lang.cmd.otherfun.rpsloose}`);
    };

    let word     = args[0];
    let decision = bot.misc.randomString([[0, ":rock:"], [1, ":newspaper:"], [2, ":scissors:"]]); // Get decision by index ["rock", "paper", "scissors"]

    switch (word) { // User decision
        case "r":
        case "rock":
            if (decision == 2) sendresponse([0, ":rock:"], decision, "win"); // User wins
                else sendresponse([0, ":rock:"], decision, "loose"); // User looses (or tie but that gets handled by function)
            break;
        case "p":
        case "paper":
            if (decision == 1) sendresponse([1, ":newspaper:"], decision, "win");
                else sendresponse([1, ":newspaper:"], decision, "loose");
            break;
        case "s":
        case "scissors":
            if (decision == 0) sendresponse([2, ":scissors:"], decision, "win");
                else sendresponse([2, ":scissors:"], decision, "loose");
            break;
        default:
            return message.channel.send(lang.cmd.otherfun.rpsusage);
    }

};

module.exports.info = {
    names: ["rps"],
    description: "cmd.otherfun.rpsinfodescription",
    usage: "('r'/'rock'/'p'/'paper'/'s'/'scissors')",
    options: [
        {
            name: "choice",
            description: "Your choice",
            required: true,
            type: Discord.ApplicationCommandOptionType.String,
            choices: [
                { name: "Rock", value: "rock" },
                { name: "Paper", value: "paper" },
                { name: "Scissors", value: "scissors" }
            ]
        }
    ],
    accessableby: ["all"],
    allowedindm: true,
    nsfwonly: false
};
