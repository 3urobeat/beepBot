/*
 * File: movemsg.js
 * Project: beepbot
 * Created Date: 2021-01-12 18:34:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 09:25:49
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js"); // eslint-disable-line

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The movemsg command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    let lf = lang.cmd.movemsg;

    if (!args[0] && !message.reference) return message.channel.send(lf.missingargs);


    // Get message to move
    let msgid;

    if (message.reference) { // Check if user replied to the message
        msgid = message.reference.messageId;
        args.unshift(msgid); // Add msgid to beginning of the array so that the next channelcheck doesn't get confused because otherwise the channel arg would now be index 0 and not 1

    } else if (args[0].startsWith("https://discord.com/channels/")) { // Check if user linked the message
        let newargs = args[0].toLowerCase().replace("https://discord.com/channels/", "").split("/");
        if (newargs[0] != message.guild.id || newargs[1] != message.channel.id) return message.channel.send(lf.wrongchannel);

        msgid = newargs[2];

    } else if (args[0].length === 18 && /^\d+$/.test(args[0])) { // Check if user provided the message id
        msgid = args[0];

    } else if (!isNaN(parseInt(args[0]))) { // Check if the user wants to move last x messages
        if (parseInt(args[0]) > 25) return message.channel.send(lf.toomanymsgs);
        message.react("⏳"); // React to let user know that something is happening if fetching all messages should take longer

        message.channel.messages.fetch({ limit: parseInt(args[0]) + 1 }).then((messages) => { // + 1 because we need to add the command message (will be removed later)
            msgid = messages;
        });
    }


    // Wait until msgid is defined (can take a bit longer if the bot needs to fetch multiple messages)
    let waitformsgid = setInterval(async () => {
        if (message.createdTimestamp + 15000 < Date.now()) { // Took longer than 15 seconds to fetch all messages? abort.
            message.channel.send(lf.tooktoolong);
            clearInterval(waitformsgid);
            return;
        }

        if (typeof(msgid) == "undefined") return; // Continue to wait if msgid is still undefined
        clearInterval(waitformsgid); // Clear interval now so that the code below can't possibly get executed twice

        // Get channel to move msg to
        if (!args[1]) return message.channel.send(lf.missingchannel);

        let movechannelid;

        try {
            if (args[1].length === 18 && /^\d+$/.test(args[1])) { // Check if the arg is 18 chars long and if it is a number
                movechannelid = args[1].toString();
            } else if (args[1].match(/(?<=<#)[0-9]{18}?(?=>)/g)) { // <#18numbers>
                movechannelid = args[1].toString().replace(/[<#>]/g, "");
            } else {
                movechannelid = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args[1].toLowerCase()).id; // Not a channelid so try and find by name (channelnames can't have spaces so no need to join array)
            }
        } catch (err) {
            return message.channel.send(lf.channelnotfound);
        }

        // Get reason if there is one
        bot.getReasonFromMsg(args, [undefined], async (reason, reasontext) => {
            let movereason = reasontext;

            if (movereason.length >= 1500) movereason = movereason.slice(0, 1500) + "..."; // Don't want the footer to be longer than 1500 (although it supports up to 2048 but wtf and even 1500 is way too long)

            // Get the message(s) to move
            let embed = {};
            let originalmsg;
            let originalattachments;

            if (typeof (msgid) == "object") { // Multiple fetched messages
                embed = {
                    title: lf.convotitle.replace("channelname", `#${message.channel.name}`),
                    fields: [], // Original messages
                    footer: {
                        icon_url: message.author.displayAvatarURL(), // eslint-disable-line camelcase
                        text: `${lf.movedby.replace("author", `@${message.author.displayName}`)} • ${lang.general.reason}: ${movereason}` // Moved by and reason
                    }
                };

                // Sort the collection by timestamp because Discord fetches it without the right order
                // Credit: https://stackoverflow.com/a/5073866/12934162
                let sort = function (prop, arr) {
                    prop = prop.split(".");
                    let len = prop.length;

                    arr.sort(function (a, b) {
                        let i = 0;
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


                let sortedarray = sort("createdTimestamp", [...msgid.values()]);

                sortedarray.forEach((e, i) => {
                    if (e.id == message.id) return; // Stop if this is the command message

                    let originalcontent = e.content;

                    // Handle embed as we can't display it and content is usually empty
                    if (e.embeds.length > 0) {
                        if (originalcontent.length > 0) originalcontent += "\n\n"; // If there is text put a new line between the text and the embed note
                        originalcontent += lf.isembed.replace("embedtitle", e.embeds[0].title);
                    }

                    // Handle attachment
                    if (e.attachments.length > 0) {
                        if (originalcontent > 0) originalcontent += "\n\n"; // If there is text put a new line between the text and attachment url
                        originalcontent += `${lf.attachment}: ${e.attachments[0].url}`;
                    }

                    // Check if message is a beepBot command and suppress markdown
                    if (e.content.startsWith(guildsettings.prefix)) {
                        let cont = e.content.slice(guildsettings.prefix.length).split(" "); // Slice prefix from message
                        if (bot.data.commands.get(cont[0].toLowerCase())) originalcontent = originalcontent.replace(guildsettings.prefix, `\`${guildsettings.prefix}\``); // Check if command exists and if so add ` around prefix in message (replace applies to first occurrence)
                    }

                    if (originalcontent.length > 1020) { // 1024 is the field value character limit
                        originalcontent.slice(0, 1020) + "...";
                    }

                    if (originalcontent.length == 0) return; // Something probably went wrong but this message appears to be empty so lets stop to suppress an error

                    // If the author is the same as from the last iteration/message and the last message is more recent than 1 min then attach it to the last field - otherwise create new field
                    if (i > 0 && sortedarray[i - 1].author.id == e.author.id && sortedarray[i - 1].createdTimestamp - e.createdTimestamp < 60000) {
                        embed.fields[embed.fields.length - 1].value += `\n${originalcontent}`;
                    } else {
                        embed.fields.push({
                            name: lf.convofieldname.replace("author", `@${e.author.displayName}`).replace("time", (new Date(e.createdTimestamp)).toISOString().replace(/T/, " ").replace(/\..+/, "")),
                            value: originalcontent
                        });
                    }
                });

            } else { // One message

                originalmsg = await message.channel.messages.fetch({ message: String(msgid) });
                if (!originalmsg) return message.channel.send(lf.messagenotfound);

                let originalcontent = originalmsg.content;
                let thumbnail = null; // Set to null so that if it isn't getting changed the embed thumbnail will stay empty
                originalattachments = []; // Same as line above but for files

                // Handle embed as we can't display it and content is usually empty
                if (originalmsg.embeds.length > 0) {
                    if (originalcontent.length > 0) originalcontent += "\n\n"; // If there is text put a new line between the text and the embed note
                    originalcontent += lf.isembed.replace("embedtitle", originalmsg.embeds[0].title);
                }

                // Process attachment
                if ([...originalmsg.attachments.values()].length > 0) {
                    let attachmenturlarr = [...originalmsg.attachments.values()][0].url.split(".");
                    let allowedfiletypes = ["jpg", "jpeg", "png", "gif"];

                    if (allowedfiletypes.includes(attachmenturlarr[attachmenturlarr.length - 1]) && attachmenturlarr[attachmenturlarr.length - 1] != "gifv") { // If file type is allowed put it in the thumbnail
                        thumbnail = [...originalmsg.attachments.values()][0].url;
                    } else { // Otherwise put the url in the text
                        if (originalcontent.length > 0) originalcontent += "\n\n"; // If there is text put a new line between the text and attachment url
                        originalcontent += `${lf.seeattachment}`;
                        originalattachments = [...originalmsg.attachments.values()];
                    }
                }

                // Check if message is a beepBot command and suppress markdown
                if (originalmsg.content.startsWith(guildsettings.prefix)) {
                    let cont = message.content.slice(guildsettings.prefix.length).split(" "); // Slice prefix from message
                    if (bot.data.commands.get(cont[1].toLowerCase())) originalcontent = originalcontent.replace(guildsettings.prefix, `\`${guildsettings.prefix}\``); // Check if command exists and if so add ` around prefix in message
                }

                if (originalcontent.length > 1020) { // 1024 is the field value character limit
                    originalcontent.slice(0, 1020) + "...";
                }

                if (originalcontent.length == 0) originalcontent = "** **"; // Makes field look empty and avoid an error

                embed = {
                    title: lf.title.replace("username", `@${originalmsg.author.displayName}`).replace("channelname", `#${message.channel.name}`),
                    fields: [{
                        name: `${lf.fieldname.replace("time", (new Date(originalmsg.createdTimestamp)).toISOString().replace(/T/, " ").replace(/\..+/, ""))}:`, // "original msg" from utc time
                        value: originalcontent // Original msg content
                    }],
                    image: {
                        url: thumbnail
                    },
                    footer: {
                        icon_url: message.author.displayAvatarURL(), // eslint-disable-line camelcase
                        text: `${lf.movedby.replace("author", `@${message.author.displayName}`)} • ${lang.general.reason}: ${movereason}`  // Moved by and reason
                    }
                };
            }

            message.guild.channels.cache.get(movechannelid).send({ embeds: [embed], files: originalattachments }) // If no attachments in original msg then the array will be empty
                .then(() => {
                    message.delete().catch(err => { message.channel.send(`${lf.errordeletingmsg}: ${err}`); });

                    if (typeof(msgid) == "object") {
                        message.channel.bulkDelete(msgid).catch(err => { message.channel.send(`${lf.errordeletingmsg}: ${err}`); }); // Msgid is a collection with all fetched messages in this case
                        bot.msgToModlogChannel(message.guild, "movemsg", message.author, "", ["convo", args[0], movereason, message.channel.id, movechannelid]); // Pass information to modlog function

                    } else {

                        // Put all attachments into message as we won't bother with files in the modlogmsg so the code from above won't work here
                        let modlogcontent = originalmsg.content;

                        if ([...originalmsg.attachments.values()].length > 0) {
                            if (modlogcontent.length > 0) modlogcontent += "\n\n"; // If there is text put a new line between the text and attachment url
                            modlogcontent += `${lf.attachment}: ${[...originalmsg.attachments.values()][0].url}`; // Add url to text since the modlogchannel msg won't bother with files
                        }

                        originalmsg.delete().catch(err => { message.channel.send(`${lf.errordeletingmsg}: ${err}`); });
                        bot.msgToModlogChannel(message.guild, "movemsg", message.author, originalmsg.author, ["single", modlogcontent, movereason, message.channel.id, movechannelid]); // Pass information to modlog function
                    }
                })
                .catch(err => {
                    message.channel.send(`${lf.errormovingmsg}: ${err}`);
                    message.react("❌").catch(() => {}); // Catch but ignore error
                    return;
                });
        }, 250);
    });

};

module.exports.info = {
    names: ["movemsg", "movemessage"],
    description: "cmd.movemsg.infodescription",
    usage: "(use cmd in reply/message id/message link/amount of messages) (channelname/channelmention) [-r reason]",
    options: [
        {
            name: "message",
            description: "ID/URL of the msg or a number of msgs to move. Pass a 0 if you use this cmd in a reply",
            required: true,
            type: Discord.ApplicationCommandOptionType.String
        },
        {
            name: "channel",
            description: "The channel where the message(s) should be moved to",
            required: true,
            type: Discord.ApplicationCommandOptionType.Channel
        },
        {
            name: "reason",
            description: "The reason of the move",
            required: false,
            type: Discord.ApplicationCommandOptionType.String,
            prefix: "-r"
        }
    ],
    accessableby: ["moderators"],
    allowedindm: false,
    nsfwonly: false
};
