/*
 * File: coinflip.js
 * Project: beepbot
 * Created Date: 07.08.2020 20:02:00
 * Author: 3urobeat
 * 
 * Last Modified: 17.11.2021 19:07:12
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    message.channel.send(`${lang.cmd.othermisc.coinflipped} **${fn.randomstring(lang.cmd.othermisc.coinfliprandommsg)}**!`)
}

module.exports.info = {
    names: ["coinflip", "coin", "flip"],
    description: "cmd.othermisc.coinflipinfodescription",
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}