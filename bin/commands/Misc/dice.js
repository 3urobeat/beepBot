/*
 * File: dice.js
 * Project: beepbot
 * Created Date: 07.08.2020 20:02:00
 * Author: 3urobeat
 * 
 * Last Modified: 17.11.2021 19:07:41
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    var messagecount = parseInt(args[0]);
    var randomnumber = Math.floor((Math.random() * messagecount) + 1);

    let nomaxprovided = lang.cmd.othermisc.dicenomaxprovided

    if (!args[0]) return message.channel.send(nomaxprovided);
    if (isNaN(messagecount)) return message.channel.send(nomaxprovided);
    if (messagecount < 2) return message.channel.send(nomaxprovided);

    message.channel.send(':game_die: ' + fn.randomstring(lang.cmd.othermisc.dicerandommsg) + " **" + randomnumber + "**")
    return;
}

module.exports.info = {
    names: ["dice", "roll"],
    description: "cmd.othermisc.diceinfodescription",
    usage: "(limit)",
    accessableby: ['all'], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false
}