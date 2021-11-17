/*
 * File: pgif.js
 * Project: beepbot
 * Created Date: 01.10.2020 18:53:00
 * Author: 3urobeat
 * 
 * Last Modified: 17.11.2021 19:17:33
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
        let { body } = await require("superagent").get('https://nekobot.xyz/api/image?type=pgif')

        message.channel.send({
            embeds: [{
                title: lang.general.imagehyperlink,
                url: body.message,
                image: {
                    url: body.message
                },
                footer: {
                    text: `${lang.general.poweredby} NekoBot API`
                },
                timestamp: message.createdAt,
                color: fn.randomhex()
            }]
        })

    } catch (err) {
        logger("error", "pgif.js", "API Error: " + err)
        message.channel.send(`nekobot.xyz pgif API ${lang.general.error}: ${err}`)
    }
}

module.exports.info = {
    names: ["pgif", "porngif"],
    description: "cmd.othernsfw.pgifinfodescription",
    usage: "",
    accessableby: ['all'], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: true
}