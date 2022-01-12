/*
 * File: cat.js
 * Project: beepbot
 * Created Date: 12.01.2022 14:01:47
 * Author: 3urobeat
 * 
 * Last Modified: 12.01.2022 14:05:11
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2022 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


const Discord = require('discord.js'); //eslint-disable-line

/**
 * The cat command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The recieved message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    try {
        let { body } = await require("superagent").get('http://aws.random.cat/meow')

        message.channel.send({
            embeds: [{
                title: lang.general.imagehyperlink,
                url: body.file,
                image: {
                    url: body.file
                },
                footer: {
                    text: `${lang.general.poweredby} random.cat API`
                },
                timestamp: message.createdAt,
                color: fn.randomhex()
            }]
        })

    } catch (err) {
        logger("error", "cat.js", "API Error: " + err)
        message.channel.send(`random.cat API ${lang.general.error}: ${err}`)
    }
}

module.exports.info = {
    names: ["cat", "meow"],
    description: "cmd.otherfun.catinfodescription",
    usage: '',
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}