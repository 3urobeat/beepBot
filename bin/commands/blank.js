/*
 * File: blank.js
 * Project: beepbot
 * Created Date: 02.08.2020 22:07:00
 * Author: 3urobeat
 * 
 * Last Modified: 17.11.2021 19:19:01
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


/* eslint-disable */ //remove this
const Discord = require('discord.js'); //eslint-disable-line

/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    let lf = lang //Should this file use his lang file path often use this var as shorthand
    
}

module.exports.info = { //Note to self: If you add more restrictions you need to add them to the restrictions field in the help cmd!
    names: [], //Array<String> with all aliases
    description: "", //Path to lang file entry (example: "cmd.othergeneral.pinginfodescription")
    usage: '',
    accessableby: [''], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false,
    allowedguilds: config.musicenabledguilds //Optional value. Provide array with guildids as Strings that should only be allowed to use this command
}