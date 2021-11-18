/*
 * File: movemsg.js
 * Project: beepbot
 * Created Date: 12.01.2021 18:34:00
 * Author: 3urobeat
 * 
 * Last Modified: 18.11.2021 20:21:36
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
 * The movemsg command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The recieved message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    let lf = lang.cmd.movemsg

    if (!args[0] && !message.reference) return message.channel.send(lf.missingargs)

    //get message to move
    if (message.reference) { //check if user replied to the message
        var msgid = message.reference.messageId
        args.unshift(msgid) //add msgid to beginning of the array so that the next channelcheck doesn't get confused because otherwise the channel arg would now be index 0 and not 1

    } else if (args[0].startsWith("https://discord.com/channels/")) { //check if user linked the message
        var newargs = args[0].toLowerCase().replace("https://discord.com/channels/", "").split("/")
        if (newargs[0] != message.guild.id || newargs[1] != message.channel.id) return message.channel.send(lf.wrongchannel)

        var msgid = newargs[2]

    } else if (args[0].length === 18 && /^\d+$/.test(args[0])) { //Check if user provided the message id
        var msgid = args[0]

    } else if (!isNaN(parseInt(args[0]))) { //Check if the user wants to move last x messages
        if (parseInt(args[0]) > 25) return message.channel.send(lf.toomanymsgs)
        message.react("⏳") //react to let user know that something is happening if fetching all messages should take longer

        message.channel.messages.fetch({ limit: parseInt(args[0]) + 1 }).then(messages => { //+ 1 because we need to add the command message (will be removed later)
            msgid = messages
        })
    }

    //wait until msgid is defined (can take a bit longer if the bot needs to fetch multiple messages)
    var waitformsgid = setInterval(async () => {
        if (message.createdTimestamp + 15000 < Date.now()) { //took longer than 15 seconds to fetch all messages? abort.
            message.channel.send(lf.tooktoolong)
            clearInterval(waitformsgid) 
            return;
        }
               
        if (typeof(msgid) == "undefined") return; //continue to wait if msgid is still undefined
        clearInterval(waitformsgid) //Clear interval now so that the code below can't possibly get executed twice

        //get channel to move msg to
        if (!args[1]) return message.channel.send(lf.missingchannel)

        try {
            if (args[1].length === 18 && /^\d+$/.test(args[1])) { //Check if the arg is 18 chars long and if it is a number
                var movechannelid = args[1].toString()
            } else if (args[1].match(/(?<=<#)[0-9]{18}?(?=>)/g)) { // <#18numbers>
                var movechannelid = args[1].toString().replace(/[<#>]/g, "")
            } else {
                var movechannelid = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args[1].toLowerCase()).id //not a channelid so try and find by name (channelnames can't have spaces so no need to join array)
            }
        } catch (err) {
            return message.channel.send(lf.channelnotfound)
        }

        //get reason if there is one
        if (args[2]) var movereason = args.slice(2).join(" ")
            else var movereason = "/"

        if (movereason.length >= 1500) var movereason = movereason.slice(0, 1500) + '...' //don't want the footer to be longer than 1500 (although it supports up to 2048 but wtf and even 1500 is way too long)

        //get the message(s) to move
        var embed = {}
        if (typeof (msgid) == "object") { //multiple fetched messages

            embed = {
                title: lf.convotitle.replace("channelname", `#${message.channel.name}`),
                fields: [], //original messages
                footer: {
                    icon_url: message.author.displayAvatarURL(),
                    text: `${lf.movedby.replace("author", `${message.author.username}#${message.author.discriminator}`)} • ${lang.general.reason}: ${movereason}` //moved by and reason
                }
            }

            //Sort the collection by timestamp because Discord fetches it without the right order
            //Credit: https://stackoverflow.com/a/5073866/12934162
            var sort = function (prop, arr) {
                prop = prop.split('.');
                var len = prop.length;
            
                arr.sort(function (a, b) {
                    var i = 0;
                    while( i < len ) { a = a[prop[i]]; b = b[prop[i]]; i++; }
                    if (a < b) {
                        return -1;
                    } else if (a > b) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                return arr;
            };


            let sortedarray = sort("createdTimestamp", [...msgid.values()])

            sortedarray.forEach((e, i) => {
                if (e.id == message.id) return; //stop if this is the command message

                var originalcontent = e.content

                //Handle embed as we can't display it and content is usually empty
                if (e.embeds.length > 0) {
                    if (originalcontent > 0) originalcontent += "\n\n" //if there is text put a new line between the text and the embed note
                    originalcontent += lf.isembed.replace("embedtitle", e.embeds[0].title)
                }

                //Handle attachment
                if (e.attachments.length > 0) {
                    if (originalcontent > 0) originalcontent += "\n\n" //if there is text put a new line between the text and attachment url
                    originalcontent += `${lf.attachment}: ${e.attachments[0].url}`
                }

                //Check if message is a beepBot command and suppress markdown
                if (e.content.startsWith(guildsettings.prefix)) {
                    var cont = e.content.slice(guildsettings.prefix.length).split(" "); //slice prefix from message
                    if (bot.commands.get(cont[0].toLowerCase())) originalcontent = originalcontent.replace(guildsettings.prefix, `\`${guildsettings.prefix}\``) //check if command exists and if so add ` around prefix in message (replace applies to first occurrence)
                }

                if (originalcontent.length > 1020) { //1024 is the field value character limit
                    originalcontent.slice(0, 1020) + "..."
                }

                if (originalcontent.length == 0) return; //something probably went wrong but this message appears to be empty so lets stop to suppress an error

                //if the author is the same as from the last iteration/message and the last message is more recent than 1 min then attach it to the last field - otherwise create new field
                if (i > 0 && sortedarray[i - 1].author.id == e.author.id && sortedarray[i - 1].createdTimestamp - e.createdTimestamp < 60000) {
                    embed.fields[embed.fields.length - 1].value += `\n${originalcontent}`
                } else {
                    embed.fields.push({
                        name: lf.convofieldname.replace("author", `${e.author.username}#${e.author.discriminator}`).replace("time", (new Date(e.createdTimestamp)).toISOString().replace(/T/, ' ').replace(/\..+/, '')),
                        value: originalcontent
                    })
                }
            })

        } else { //one message

            var originalmsg = await message.channel.messages.fetch(String(msgid))
            if (!originalmsg) return message.channel.send(lf.messagenotfound)

            var originalcontent = originalmsg.content
            var thumbnail = null //set to null so that if it isn't getting changed the embed thumbnail will stay empty
            var originalattachments = [] //same as line above but for files

            //Handle embed as we can't display it and content is usually empty
            if (originalmsg.embeds.length > 0) {
                if (originalcontent > 0) originalcontent += "\n\n" //if there is text put a new line between the text and the embed note
                originalcontent += lf.isembed.replace("embedtitle", originalmsg.embeds[0].title)
            }

            //process attachment
            if ([...originalmsg.attachments.values()].length > 0) {
                let attachmenturlarr = [...originalmsg.attachments.values()][0].url.split(".")
                let allowedfiletypes = ["jpg", "jpeg", "png", "gif"]

                if (allowedfiletypes.includes(attachmenturlarr[attachmenturlarr.length - 1]) && attachmenturlarr[attachmenturlarr.length - 1] != "gifv") { //if file type is allowed put it in the thumbnail
                    thumbnail = [...originalmsg.attachments.values()][0].url
                } else { //otherwise put the url in the text
                    if (originalcontent.length > 0) originalcontent += "\n\n" //if there is text put a new line between the text and attachment url
                    originalcontent += `${lf.seeattachment}`
                    originalattachments = [...originalmsg.attachments.values()]
                }
            }

            //Check if message is a beepBot command and suppress markdown
            if (originalmsg.content.startsWith(guildsettings.prefix)) {
                var cont = message.content.slice(guildsettings.prefix.length).split(" "); //slice prefix from message
                if (bot.commands.get(cont[1].toLowerCase())) originalcontent = originalcontent.replace(guildsettings.prefix, `\`${guildsettings.prefix}\``) //check if command exists and if so add ` around prefix in message
            }

            if (originalcontent.length > 1020) { //1024 is the field value character limit
                originalcontent.slice(0, 1020) + "..."
            }

            if (originalcontent.length == 0) originalcontent = "** **" //makes field look empty and avoid an error

            embed = {
                title: lf.title.replace("username", `${originalmsg.author.username}#${originalmsg.author.discriminator}`).replace("channelname", `#${message.channel.name}`),
                fields: [{
                    name: `${lf.fieldname.replace("time", (new Date(originalmsg.createdTimestamp)).toISOString().replace(/T/, ' ').replace(/\..+/, ''))}:`, //"original msg" from utc time
                    value: originalcontent //original msg content
                }],
                image: {
                    url: thumbnail
                },
                footer: {
                    icon_url: message.author.displayAvatarURL(),
                    text: `${lf.movedby.replace("author", `${message.author.username}#${message.author.discriminator}`)} • ${lang.general.reason}: ${movereason}`  //moved by and reason
                }
            }
        }

        message.guild.channels.cache.get(movechannelid).send({ embeds: [embed], files: originalattachments }) //if no attachments in original msg then the array will be empty
            .then(() => {
                message.delete().catch(err => { message.channel.send(`${lf.errordeletingmsg}: ${err}`) })

                if (typeof(msgid) == "object") { 
                    message.channel.bulkDelete(msgid).catch(err => { message.channel.send(`${lf.errordeletingmsg}: ${err}`) }) //msgid is a collection with all fetched messages in this case
                    fn.msgtomodlogchannel(message.guild, "movemsg", message.author, "", ["convo", args[0], movereason, message.channel.id, movechannelid]) //pass information to modlog function
                } else {
                    //put all attachments into message as we won't bother with files in the modlogmsg so the code from above won't work here
                    var modlogcontent = originalmsg.content

                    if ([...originalmsg.attachments.values()].length > 0) {
                        if (modlogcontent.length > 0) modlogcontent += "\n\n" //if there is text put a new line between the text and attachment url
                        modlogcontent += `${lf.attachment}: ${[...originalmsg.attachments.values()][0].url}` //add url to text since the modlogchannel msg won't bother with files
                    }

                    originalmsg.delete().catch(err => { message.channel.send(`${lf.errordeletingmsg}: ${err}`) })
                    fn.msgtomodlogchannel(message.guild, "movemsg", message.author, originalmsg.author, ["single", modlogcontent, movereason, message.channel.id, movechannelid]) //pass information to modlog function
                }
            })
            .catch(err => { 
                message.channel.send(`${lf.errormovingmsg}: ${err}`);
                message.react("❌").catch(() => {}) //catch but ignore error
                return;
            })
    }, 250);

}

module.exports.info = {
    names: ["movemsg", "movemessage"],
    description: "cmd.movemsg.infodescription",
    usage: "(use cmd in reply/message id/message link/amount of messages) (channelname/channelmention) [-r reason]",
    accessableby: ['moderators'],
    allowedindm: false,
    nsfwonly: false
}