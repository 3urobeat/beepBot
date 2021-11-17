/*
 * File: say.js
 * Project: beepbot
 * Created Date: 29.11.2020 14:24:00
 * Author: 3urobeat
 * 
 * Last Modified: 17.11.2021 18:59:10
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    if (!args[0]) return message.channel.send(lang.cmd.otherbotowner.saymissingargs)

    message.delete().catch(err => { 
        return message.channel.send("Error deleting message: " + err);
    })

    message.channel.send(args.join(" "));
    
}

module.exports.info = {
    names: ["say"],
    description: "cmd.otherbotowner.sayinfodescription",
    usage: "(text)",
    accessableby: ['botowner'],
    allowedindm: true,
    nsfwonly: false
}