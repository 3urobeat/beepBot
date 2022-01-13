/*
 * File: interactionCreate.js
 * Project: beepbot
 * Created Date: 13.01.2022 13:20:08
 * Author: 3urobeat
 * 
 * Last Modified: 13.01.2022 17:35:29
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
 * The interactionCreate event
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Interaction} interaction The interaction which was created
 */
module.exports.run = async (bot, interaction) => { //eslint-disable-line

    switch (interaction.customId) {
        case "welcomeLang":
            if (!interaction.isSelectMenu()) return;

            var requestedlang = bot.langObj[interaction.values[0]]

            //Construct menu again in order to be able to update the placeholder (I just couldn't find a better way yet and interaction.update always reset the user's choice)
            var langArray = []

            Object.values(bot.langObj).forEach((e, i) => { //push each language to the array
                langArray.push({
                    label: e.general.thislang,
                    emoji: e.general.langemote,
                    value: Object.keys(bot.langObj)[i]
                })
            })

            var langComponents = [
                new Discord.MessageActionRow()
                    .addComponents(
                        new Discord.MessageSelectMenu()
                            .setCustomId('welcomeLang')
                            .setPlaceholder(`${requestedlang.general.langemote} ${requestedlang.general.botaddchooselang}`)
                            .addOptions(langArray)
                    )
            ]

            //Update message with new language
            interaction.update({
                embeds: [{
                    title: requestedlang.general.botaddtitle,
                    description: requestedlang.general.botadddesc + requestedlang.general.botadddesc2.replace(/prefix/g, bot.constants.DEFAULTPREFIX),
                    thumbnail: { url: bot.user.displayAvatarURL() }
                }],
                components: langComponents
            })

            //update guilds language aswell
            bot.settings.update({ guildid: interaction.guild.id }, { $set: { lang: interaction.values[0] }}, {}, () => { }) //catch but ignore error
            break;
    }

}