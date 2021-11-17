/*
 * File: boobs.js
 * Project: beepbot
 * Created Date: 01.10.2020 18:53:00
 * Author: 3urobeat
 * 
 * Last Modified: 17.11.2021 19:16:50
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    try {
        //Note: If this API shouldn't work anymore, use nekobot: https://nekobot.xyz/api/image?type=boobs
        let { body } = await require("superagent").get('http://api.oboobs.ru/boobs/0/1/random')
        
        let imageurl = "http://media.oboobs.ru/" + body[0].preview

        message.channel.send({
            embeds: [{
                title: lang.general.imagehyperlink,
                url: imageurl,
                image: {
                    url: imageurl
                },
                footer: {
                    text: `${lang.general.poweredby} api.oboobs.ru`
                },
                timestamp: message.createdAt,
                color: fn.randomhex()
            }]
        })

    } catch (err) {
        logger("error", "boobs.js", "API Error: " + err)
        message.channel.send(`api.oboobs.ru boobs API ${lang.general.error}: ${err}`)
    }
}

module.exports.info = {
    names: ["boobs", "tits"],
    description: "cmd.othernsfw.boobsinfodescription",
    usage: "",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: true
}