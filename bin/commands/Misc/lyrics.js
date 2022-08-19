/*
 * File: lyrics.js
 * Project: beepbot
 * Created Date: 12.01.2021 18:34:00
 * Author: 3urobeat
 * 
 * Last Modified: 19.08.2022 18:41:01
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


const Discord = require('discord.js'); //eslint-disable-line

/**
 * The lyrics command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The recieved message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line  
    if (!args[0]) return message.channel.send(lang.cmd.othermisc.lyricsmissingargs)

    const msg = await message.channel.send(lang.cmd.othermisc.lyricssearching)

    try {
        let { body } = await require("superagent").get('https://some-random-api.ml/lyrics?title=' + args.join(" "))

        if (body.error) { //Error? What a bummer
            if (body.error == "Sorry I couldn't find that song's lyrics") {
                return message.channel.send(lang.cmd.othermisc.lyricsnotfound) //just didn't find anything
            } else { //oh shit other problem
                msg.edit(`API ${lang.general.error}: ${body.error}`)
                logger("error", "lyrics.js", "Error: " + body.error)
                return;
            }
        }

        var str = body.lyrics;

        if (str.length < 6000) {
            var fullmsg = { 
                content: "** **",
                embeds: [{
                    title: `${body.author} - ${body.title}`,
                    url: body.links.genius,
                    thumbnail: { url: body.thumbnail.genius },
                    description: str.slice(0, 2048),
                    fields: [],
                    timestamp: message.createdAt,
                    footer: {
                        text: `${lang.general.poweredby} some-random-api.ml & genius.com`
                    },
                    color: fn.randomhex()
                }] 
            }

            //longer than description character limit? field limits: https://birdie0.github.io/discord-webhooks-guide/other/field_limits.html
            if (str.length > 2048) fullmsg.embeds[0].fields.push({ name: "** **", value: str.slice(2048, 3072) })
            if (str.length > 3072) fullmsg.embeds[0].fields.push({ name: "** **", value: str.slice(3072, 4096) })
            if (str.length > 4096) fullmsg.embeds[0].fields.push({ name: "** **", value: str.slice(4096, 5120) })
            if (str.length > 5120) fullmsg.embeds[0].fields.push({ name: "** **", value: str.slice(5120, 899) })

            msg.edit(fullmsg)
        } else {
            msg.edit(`${lang.cmd.othermisc.lyricslongerthan6000}\n${body.links.genius}`) //longer than 6000? then just display message with link
        }

    } catch (err) {
        logger("error", "lyrics.js", "API Error: " + err)
        msg.edit(`API ${lang.general.error}: ${err}`)
    }
}

module.exports.info = { //Note to self: If you add more restrictions you need to add them to the restrictions field in the help cmd!
    names: ["lyrics", "l"], //Array<String> with all aliases
    description: "cmd.othermisc.lyricsinfodescription",
    usage: "(song name)",
    options: [
        {
            name: "song-name",
            description: "The name of the song to search lyrics for",
            required: true,
            type: Discord.ApplicationCommandOptionType.String
        }
    ],
    accessableby: ['all'], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false
}