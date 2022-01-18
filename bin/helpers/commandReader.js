/*
 * File: commandReader.js
 * Project: beepbot
 * Created Date: 18.01.2022 11:39:32
 * Author: 3urobeat
 * 
 * Last Modified: 18.01.2022 12:23:39
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2022 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


const Discord = require("discord.js"); //eslint-disable-line
const path    = require("path");
const fs      = require("fs");

/**
 * Reads all commands in ./bin/commands and loads them into a bot.commands collection
 * @param {Discord.Client} bot The discord client class
 */
module.exports.run = (bot) => {
    
    bot.commands = new Discord.Collection();

    const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())

    dirs('./bin/commands').forEach((k) => {
        fs.readdir(`./bin/commands/${k}`, (err, files) => {
            if (err) logger('error', 'bot.js', err);
            var jsfiles = files.filter(p => p.split('.').pop() === 'js');
            
            jsfiles.forEach((f) => {
                var cmd = require(`../commands/${k}/${f}`);

                for(let j = 0; j < cmd.info.names.length; j++) { //get all aliases of each command
                    var tempcmd = JSON.parse(JSON.stringify(cmd)) //Yes, this practice of a deep copy is probably bad but everything else also modified other Collection entries and I sat at this problem for 3 fucking hours now
                    tempcmd["run"] = cmd.run //Add command code to new deep copy because that got lost somehow
                    tempcmd.info.category = k

                    if (bot.commands.get(tempcmd.info.names[j])) return logger("warn", "bot.js", `Duplicate command name found! Command: ${tempcmd.info.names[j]}`, true)

                    if (j != 0) tempcmd.info.thisisanalias = true //seems like this is an alias
                        else tempcmd.info.thisisanalias = false

                    bot.commands.set(tempcmd.info.names[j], tempcmd)
                }
            })
        })
    })
}