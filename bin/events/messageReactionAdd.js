/*
 * File: messageReactionAdd.js
 * Project: beepbot
 * Created Date: 07.02.2021 17:27:00
 * Author: 3urobeat
 *
 * Last Modified: 30.06.2023 09:44:28
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// This file contains code of the messageReactionAdd event and is called by bot.js
// I did this to reduce the amount of lines in bot.js to make finding stuff easier.

const Discord = require('discord.js'); //eslint-disable-line

/**
 * The messageReactionAdd event
 * @param {Discord.Client} bot The Discord client class
 * @param {Function} logger The logger function
 * @param {Discord.MessageReaction} reaction The Discord message reaction class
 * @param {Discord.User} user The Discord user class
 */
module.exports.run = (bot, logger, reaction, user) => { //eslint-disable-line
    // Fetch a reaction if it is a partial to be able to work with messages that were sent before the bot was started
    if (reaction.partial) {
        // Logger("info", "messageReactionAdd.js", `Fetching a partial reaction... ID: ${reaction.message.id}`, false, true)
        reaction.fetch()
            // .then(() => { logger("info", "messageReactionAdd.js", `Successfully fetched reaction message ${reaction.message.id}.`, false, true) })
            .catch((err) => { return logger("error", "messageReactionAdd.js", `Couldn't fetch reaction message ${reaction.message.id}! Error: ${err}`); });
    }

    if (reaction.me) return; // Ignore reactions by the bot itself

    bot.monitorreactions.findOne({ $and: [{msg: reaction.message.id}, {reaction: reaction._emoji.name}] }, async (err, doc) => { // Id and reaction itself must match
        if (!doc) return;
        if (err) return logger("error", "messageReactionAdd.js", "Error searching in db: " + err);

        switch (doc.type) {
            // Currently nothing is using this db but I didn't dare to remove it

            default:
                return logger("error", "messageReactionAdd.js", "Invalid monitorreactions type in db! Fix this please: " + doc.type);
        }
    });
};