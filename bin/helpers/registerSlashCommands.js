/*
 * File: registerSlashCommands.js
 * Project: beepbot
 * Created Date: 2022-01-14 21:01:23
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-07 17:45:59
 * Modified By: 3urobeat
 *
 * Copyright (c) 2022 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Bot = require("../bot.js");


/**
 * Registers slash commands
 */
Bot.prototype.registerSlashCommands = function() {

    let commands;

    // Either register guild or global slash commands, depending on loginmode
    if (this.data.config.loginmode == "test") {
        commands = this.client.guilds.cache.get(this.data.constants.testguildid).commands;
    } else {
        commands = this.client.application.commands;
    }

    logger("info", "registerSlashCommands.js", "Registering slash commands...", false, true);

    // eslint-ignore-next-line
    // commands.set([]); // Uncomment to reset registered slash commands

    // Convert Collection to Array and register all commands that were already read by the command reader
    [...this.client.commands.values()].forEach((e) => {
        if (e.info.names[0] == "test") return;
        if (e.info.category == "NSFW") return; // Doesn't make that great of an impression when someone sees these commands first
        if (e.info.accessableby.includes("botowner")) return;
        if (e.info.thisisanalias) return; // Don't include aliases, this would be too much

        // Test if command name or option names do not match restrictions
        if (!/^[\w-]{1,32}$/.test(e.info.names[0]) || e.info.options.some(e => !/^[\w-]{1,32}$/.test(e.name))) return logger("error", "registerSlashCommands.js", `Command name ${e.info.names[0]} or one of the options does not match command name restrictions!\nhttps://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming`);


        commands.create({
            name: e.info.names[0], // Sadly we can only provide the english command description as of now since we don't know which lang the guild is using
            description: require("lodash").get(this.data.langObj["english"], e.info.description), // Lodash is able to replace the obj path in the str with the corresponding item in the real obj. Very cool!
            options: e.info.options
        });
    });

};
