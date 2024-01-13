/*
 * File: messageReactionAdd.js
 * Project: beepbot
 * Created Date: 2021-02-07 17:27:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-07 19:18:48
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Bot = require("../bot.js");


/**
 * Handles discord.js's messageReactionAdd event of this shard
 */
Bot.prototype._attachDiscordMessageReactionAddEvent = function() {

    this.client.on("messageReactionAdd", (reaction, user) => { // eslint-disable-line

        // Fetch a reaction if it is a partial to be able to work with messages that were sent before the bot was started
        if (reaction.partial) {
            // Logger("info", "messageReactionAdd.js", `Fetching a partial reaction... ID: ${reaction.message.id}`, false, true)
            reaction.fetch()
                // .then(() => { logger("info", "messageReactionAdd.js", `Successfully fetched reaction message ${reaction.message.id}.`, false, true) })
                .catch((err) => { return logger("error", "messageReactionAdd.js", `Couldn't fetch reaction message ${reaction.message.id}! Error: ${err}`); });
        }

        if (reaction.me) return; // Ignore reactions by the bot itself

        this.data.monitorreactions.findOne({ $and: [{msg: reaction.message.id}, {reaction: reaction._emoji.name}] }, async (err, doc) => { // Id and reaction itself must match
            if (!doc) return;
            if (err) return logger("error", "messageReactionAdd.js", "Error searching in db: " + err);

            switch (doc.type) {
                // Currently nothing is using this db but I didn't dare to remove it

                default:
                    return logger("error", "messageReactionAdd.js", "Invalid monitorreactions type in db! Fix this please: " + doc.type);
            }
        });

    });

};
