/*
 * File: ready.js
 * Project: beepbot
 * Created Date: 2024-01-06 12:40:13
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-07 22:11:15
 * Modified By: 3urobeat
 *
 * Copyright (c) 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Bot = require("../bot.js");


/**
 * Handles discord.js's ready event of this shard
 */
Bot.prototype._attachDiscordReadyEvent = function() {

    this.client.on("ready", () => {

        let guilds = [...this.client.guilds.cache.values()];

        if (guilds.length == 0) return logger("warn", "ready.js", "This shard has no guilds and is therefore unused!");
        let thisshard = guilds[0].shard; // Get shard instance of this shard with this "workaround" because it isn't directly accessable


        // Set activity either to gameoverwrite or gamerotation[0]
        if (this.data.config.gameoverwrite != "" || (new Date().getDate() == 1 && new Date().getMonth() == 0)) {
            let game = this.data.config.gameoverwrite;
            if (new Date().getDate() == 1 && new Date().getMonth() == 0) game = "Happy Birthday beepBot!";

            this.client.user.setPresence({
                activities: [{
                    name: game,
                    type: this.data.constants.gametypetranslation[this.data.config.gametype],
                    url: this.data.config.gameurl
                }],
                status: this.data.config.status
            });
        } else {
            this.client.user.setPresence({
                activities: [{
                    name: this.data.config.gamerotation[0],
                    type: this.data.constants.gametypetranslation[this.data.config.gametype],
                    url: this.data.config.gameurl
                }],
                status: this.data.config.status
            });
        }


        // Read amount of commands found without aliases
        this.info.commandcount = [...this.data.commands.values()].filter(e => !e.info.thisisanalias).length;

        // Finish startup messages from controller.js
        if (thisshard.id == 0) {
            logger("", "", `> ${this.info.commandcount} commands & ${Object.keys(this.data.langObj).length} languages found!`, true);
            logger("", "", "> Successfully logged in shard0!", true);
            logger("", "", "*--------------------------------------------------------------*\n ", true);
        } else {
            logger("info", "ready.js", `Successfully logged in shard${thisshard.id}!`, false, true);
        }

        setTimeout(() => {
            logger("", "", "", true, true); // Print empty line to clear other stuff
        }, 2500);


        // Register all slash commands
        this.registerSlashCommands();

    });

};
