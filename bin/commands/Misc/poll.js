/*
 * File: poll.js
 * Project: beepbot
 * Created Date: 07.08.2020 20:02:00
 * Author: 3urobeat
 * 
 * Last Modified: 17.11.2021 19:09:23
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    await message.react("👍").catch(err => {
        message.channel.send("poll react error: " + err)
        return;
    })

    await message.react("👎").catch(err => {
        message.channel.send("poll react error: " + err)
        return;
    })

    await message.react("🤷").catch(err => {
        message.channel.send("poll react error: " + err)
        return;
    })
}

module.exports.info = {
    names: ["poll", "vote", "survey"],
    description: "cmd.othermisc.pollinfodescription",
    usage: "[poll description]",
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false
}