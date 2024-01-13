/*
 * File: reddit.js
 * Project: beepbot
 * Created Date: 2021-01-09 21:11:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-12 16:07:03
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord    = require("discord.js"); // eslint-disable-line
const superagent = require("superagent");

const Bot = require("../../bot.js"); // eslint-disable-line


/**
 * The reddit command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    let lf = lang.cmd.othermisc; // Should this file use his lang file path often use this var as shorthand

    // Check if the user provided those options and if not sets them to default values (random)
    let subreddit = args[0] || "random";
    let sort = args[1] || "random";

    // Adds r/ if t is not in the message
    if (!subreddit.toLowerCase().startsWith("r/")) {
        subreddit = "r/" + subreddit;
    }

    try {
        logger("debug", "reddit.js", "Requesting: " + "https://www.reddit.com/" + subreddit + "/" + sort + ".json");

        let { body } = await superagent.get("https://www.reddit.com/" + subreddit + "/" + sort + ".json").set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; rv:121.0) Gecko/20100101 Firefox/121.0");

        // Posts loading message
        let msg = await message.channel.send(lf.redditsearching.replace("sort", sort).replace("subreddit", subreddit));

        // Randomizer made by https://github.com/NotAWeebDev/Misaki/blob/master/commands/fun/reddit.js
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

        // Adds an :over18: emoji to the title if it is marked as nsfw
        let over18 = "";

        if (post.over_18) {
            if (!message.channel.nsfw) return msg.edit(lf.redditover18); // Check if post is 18+ but channel isn't
            if (!guildsettings.allownsfw) return msg.edit(lf.redditnsfwcmdsdisabled); // Check if nsfw commands have been disabled

            over18 = "🔞 "; // Add over18 emoji
        }

        // Checks if no thumbnail is being provided to prevent errors, checks for missing post description and if the title length is above the embed limit
        let thumbnail;

        if (post.thumbnail != "self" && post.url != "default") {
            if (post.url.includes(".jpg") || post.url.includes(".png") || post.url.includes(".gif") && !post.url.includes(".gifv")) {
                thumbnail = post.url; // If url value includes image file ending use it since it has a higher resolution (and imgur links seem to use gifv but can be played when replaced with mp4)
            } else {
                thumbnail = post.thumbnail; // If not use the crappy thumbnail
            }
        }

        let selftext = lf.redditnodescription;

        if (post.selftext != "") {
            if (post.selftext.length >= 1200) {
                selftext = post.selftext.slice(0, 1200) + "..."; // Description that is longer than 1200 so lets cut it
            } else {
                selftext = post.selftext;
            }
        }

        let title = post.title;

        if (post.title.length >= 250) {
            title = post.title.slice(0, 250) + "..."; // Title is longer than 250 so lets cut it as well
        }

        // Calculates date
        let posted = (Date.now() - new Date(post.created_utc * 1000)) / 60000;

        if (posted > 525949) {
            posted = `${bot.misc.round(posted / 525949, 0)} ${lang.general.gettimefuncoptions[5]}`;
        } else if (posted > 43829) {
            posted = `${bot.misc.round(posted / 43829, 0)} ${lang.general.gettimefuncoptions[4]}`;
        } else if (posted > 1440) {
            posted = `${bot.misc.round(posted / 1440, 0)} ${lang.general.gettimefuncoptions[3]}`;
        } else if (posted > 60) {
            posted = `${bot.misc.round(posted / 60, 0)} ${lang.general.gettimefuncoptions[2]}`;
        } else {
            posted = `${bot.misc.round(posted, 0)} ${lang.general.gettimefuncoptions[1]}`;
        }

        // Gets one random color for all messages if more than one is being send and sets the additional info to the description
        let color = bot.misc.randomHex();

        const fieldsObj = [
            {
                name: `<:updownvotes:797465355194073118> ${post.score} (${post.upvote_ratio} ${lf.redditratio})`, // Score, ratio and comments
                value: `<:comments:797461551019851787> **${post.num_comments} ${lf.redditcomments}**`,
                inline: true
            },
            {
                name: `${lang.general.by} \`u/${post.author}\` in \`${post.subreddit_name_prefixed}\``, // Posted by and how long ago
                value: lf.redditpostedago.replace("timetext", posted),
                inline: true
            }
        ];

        // If the description is short enough for one message then post it directly without splitting it up
        if (selftext.length < 1800) { // Using 1800 because of the additional description
            msg.edit({
                content: "** **",
                embeds: [{ // "" is to delete content of the "normal" searching message
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
            });

            return;
        }

    } catch (err) {
        if (err == "Error: Not found") return message.channel.send(lf.redditnotfound);

        logger("error", "reddit.js", "API Error: " + err);
        message.channel.send(`reddit API ${lang.general.error}: ${err}`);
    }
};

module.exports.info = {
    names: ["reddit"],
    description: "cmd.othermisc.redditinfodescription",
    usage: '[subreddit] ["random"/"hot"/"new"/"top"]',
    options: [
        {
            name: "subreddit",
            description: "Get a random post of a specific subreddit",
            required: false,
            type: Discord.ApplicationCommandOptionType.String
        },
        {
            name: "sort",
            description: "Sort subreddit",
            required: false,
            type: Discord.ApplicationCommandOptionType.String,
            choices: [
                { name: "random", value: "random" },
                { name: "hot", value: "hot" },
                { name: "new", value: "new" },
                { name: "top", value: "top" }
            ]
        }
    ],
    accessableby: ["all"],
    allowedindm: true,
    nsfwonly: false
};
