/*
 * File: urbandictionary.js
 * Project: beepbot
 * Created Date: 09.01.2021 21:11:00
 * Author: 3urobeat
 * 
 * Last Modified: 17.11.2021 19:10:38
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    try {
        if (!args[0]) return message.channel.send(lang)

        let { body } = await require("superagent").get(`http://urbanscraper.herokuapp.com/define/${args.join(" ")}`)
        let bodyurl = body.url.replace(/\s/g, '')

        message.channel.send({
            embeds: [{
                title: body.term.charAt(0).toUpperCase() + body.term.slice(1) + " - Urban Dictionary",
                url: bodyurl,
                color: fn.randomhex(),
                description: "** **", //Produces an empty field which looks better
                fields: [
                    {
                        name: lang.cmd.othermisc.uddefinition,
                        value: `** **\n${body.definition}` },
                    {
                        name: `${lang.general.example}:`,
                        value: `** **\n${body.example}` }
                ],
                footer: {
                    text: `${lang.general.by} ${body.author}`
                },
                timestamp: body.posted
            }]
        })
        
    } catch (err) {
        if (err == "Error: Not Found") return message.channel.send(lang.cmd.othermisc.udnotfound); //Send custom error message that nothing has been found about this search term

        logger("error", "urbandictionary.js", "API Error: " + err)
        message.channel.send(`urbandictionary API ${lang.general.error}: ${err}`)
    }
    
}

module.exports.info = {
    names: ["urban", "urbandictionary", "ud"],
    description: "cmd.othermisc.udinfodescription",
    usage: "(Search word)",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}