/*
 * File: reddit.js
 * Project: beepbot
 * Created Date: 09.01.2021 21:11:00
 * Author: 3urobeat
 * 
 * Last Modified: 12.01.2022 14:51:26
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
 * The reddit command
 * @param {Discord.Client} bot The Discord client class
 * @param {Discord.Message} message The recieved message object
 * @param {Array} args An array of arguments the user provided
 * @param {Object} lang The language object for this guild
 * @param {Function} logger The logger function
 * @param {Object} guildsettings All settings of this guild
 * @param {Object} fn The object containing references to functions for easier access
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    let lf       = lang.cmd.othermisc //Should this file use his lang file path often use this var as shorthand

    //Check if the user provided those options and if not sets them to default values (random)
    var subreddit = args[0] || "random";
    var sort = args[1] || "random";

    //adds r/ if t is not in the message
    if (!subreddit.toLowerCase().startsWith("r/")) {
        subreddit = "r/" + subreddit
    }

    try {
        let { body } = await require("superagent").get('https://www.reddit.com/' + subreddit + '/' + sort + '.json')

        //posts loading message
        let msg = await message.channel.send(lf.redditsearching.replace("sort", sort).replace("subreddit", subreddit))

        //Randomizer made by https://github.com/NotAWeebDev/Misaki/blob/master/commands/fun/reddit.js
        let post;

        try {
            if (body[0]) {
                post = body[0].data.children[Math.floor(Math.random() * body[0].data.children.length)].data;
            } else {
                post = body.data.children[Math.floor(Math.random() * body.data.children.length)].data;
            }
        } catch (err) {
            msg.edit(lf.redditnotfound);
            return;
        }
    
        //adds an :over18: emoji to the title if it is marked as nsfw
        let over18 = ""
        
        if (post.over_18) {
            if (!message.channel.nsfw) return msg.edit(lf.redditover18) //check if post is 18+ but channel isn't
            if (!guildsettings.allownsfw) return msg.edit(lf.redditnsfwcmdsdisabled) //check if nsfw commands have been disabled

            over18 = "🔞 "; //add over18 emoji
        }
    
        //checks if no thumbnail is being provided to prevent errors, checks for missing post description and if the title length is above the embed limit
        if (post.thumbnail == "self" || post.url == "default") {
            var thumbnail = null
        } else { 
            if (post.url.includes(".jpg") || post.url.includes(".png") || post.url.includes(".gif") && !post.url.includes(".gifv")) { 
                var thumbnail = post.url //if url value includes image file ending use it since it has a higher resolution (and imgur links seem to use gifv but can be played when replaced with mp4)
            } else {
                var thumbnail = post.thumbnail; //if not use the crappy thumbnail
            }
        }
        
        if (post.selftext == "") {
            var selftext = lf.redditnodescription //no description
        } else {
            if (post.selftext.length >= 1200) {
                var selftext = post.selftext.slice(0, 1200) + '...' //description that is longer than 1200 so lets cut it
            } else { 
                var selftext = post.selftext
            }
        }

        if (post.title.length >= 250) {
            var title = post.title.slice(0, 250) + '...' //title is longer than 250 so lets cut it aswell
        } else {
            var title = post.title
        }
    
        //Calculates date
        let posted = (Date.now() - new Date(post.created_utc * 1000)) / 60000;

        if (posted > 525949) {
            posted = `${fn.round(posted / 525949, 0)} ${lang.general.gettimefuncoptions[5]}`
        } else if (posted > 43829) {
            posted = `${fn.round(posted / 43829, 0)} ${lang.general.gettimefuncoptions[4]}`
        } else if (posted > 1440) {
            posted = `${fn.round(posted / 1440, 0)} ${lang.general.gettimefuncoptions[3]}`
        } else if (posted > 60) { 
            posted = `${fn.round(posted / 60, 0)} ${lang.general.gettimefuncoptions[2]}`
        } else { 
            posted = `${fn.round(posted, 0)} ${lang.general.gettimefuncoptions[1]}`
        }
    
        //gets one random color for all messages if more than one is being send and sets the additional info to the description
        let color = fn.randomhex();

        const fieldsObj = [
            {
                name: `<:updownvotes:797465355194073118> ${post.score} (${post.upvote_ratio} ${lf.redditratio})`, //score, ratio and comments
                value: `<:comments:797461551019851787> **${post.num_comments} ${lf.redditcomments}**`,
                inline: true
            },
            {
                name: `${lang.general.by} \`u/${post.author}\` in \`${post.subreddit_name_prefixed}\``, //posted by and how long ago
                value: lf.redditpostedago.replace("timetext", posted),
                inline: true
            }
        ]

        //if the description is short enough for one message then post it directly without splitting it up
        if (selftext.length < 1800) { //using 1800 because of the additional description
            msg.edit({
                content: "** **",
                embeds: [{ //"" is to delete content of the "normal" searching message
                    title: over18 + title,
                    url: `https://reddit.com${post.permalink}`,
                    image: {
                        url: thumbnail
                    },
                    description: selftext,
                    color: color,
                    fields: fieldsObj,
                    footer: {
                        text: `${lf.redditclicktitle}`
                    },
                    timestamp: message.createdAt
                }] 
            })

            return;
        }
        
    } catch (err) {
        if (err == "Error: Not found") return message.channel.send(lf.redditnotfound)

        logger("error", "reddit.js", "API Error: " + err)
        message.channel.send(`reddit API ${lang.general.error}: ${err}`)
    }
}

module.exports.info = {
    names: ["reddit"],
    description: "cmd.othermisc.redditinfodescription",
    usage: '[subreddit] ["random"/"hot"/"new"/"top"]',
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}