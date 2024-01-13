/*
 * File: commandReader.js
 * Project: beepbot
 * Created Date: 2022-01-18 11:39:32
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 13:53:07
 * Modified By: 3urobeat
 *
 * Copyright (c) 2022 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js");
const path    = require("path");
const fs      = require("fs");

const DataManager = require("../dataManager");

/**
 * Reads all commands in ./bin/commands and loads them into a collection
 */
DataManager.prototype.loadCommands = function() {

    // Create new collection
    this.commands = new Discord.Collection();

    // Iterate through directory and load every command
    const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());

    dirs("./bin/commands").forEach((k) => {
        fs.readdir(`./bin/commands/${k}`, (err, files) => {
            if (err) logger("error", "commandReader.js", err);

            let jsfiles = files.filter(p => p.split(".").pop() === "js");

            jsfiles.forEach((f) => {
                let cmd = require(`../commands/${k}/${f}`);

                for (let j = 0; j < cmd.info.names.length; j++) { // Get all aliases of each command
                    let tempcmd = JSON.parse(JSON.stringify(cmd)); // Yes, this practice of a deep copy is probably bad but everything else also modified other Collection entries and I sat at this problem for 3 fucking hours now
                    tempcmd["run"] = cmd.run; // Add command code to new deep copy because that got lost somehow
                    tempcmd.info.category = k;

                    if (this.commands.get(tempcmd.info.names[j])) return logger("warn", "commandReader.js", `Duplicate command name found! Command: ${tempcmd.info.names[j]}`, true);

                    // Determine if it is an alias based on if we are in a names iteration >0
                    tempcmd.info.thisisanalias = (j != 0);

                    this.commands.set(tempcmd.info.names[j], tempcmd);
                }
            });
        });
    });

};
