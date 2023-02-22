/*
 * File: bot.js
 * Project: beepbot
 * Created Date: 04.10.2020 18:10:00
 * Author: 3urobeat
 *
 * Last Modified: 29.09.2022 14:11:47
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// This file controls one shard
// Note: This file had like 720 lines so I moved some code into the 'events' & 'functions' folder

var bootstart   = 0;
var bootstart   = Date.now();
const shardArgs = process.argv; // eslint-disable-line no-unused-vars

const Discord  = require("discord.js");
const path     = require("path");
const nedb     = require("@yetzt/nedb");
const fs       = require("fs");

const configpath = "./config.json";
var   config     = require(configpath);
const constants  = require("./constants.json");

// I hate intents
const bot = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildBans,
        Discord.GatewayIntentBits.GuildInvites,
        Discord.GatewayIntentBits.GuildPresences,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.DirectMessageReactions,
        Discord.GatewayIntentBits.MessageContent
    ],
    partials: [Discord.Partials.Message, Discord.Partials.Reaction] // Partials are messages that are not fully cached and have to be fetched manually
});

var fn = {}; // Object that will contain all functions to be accessible from commands

var loggedin      = false;
var logafterlogin = [];

bot.config    = config; // I'm just gonna add it to the bot object as quite a few cmds will probably need the config later on
bot.constants = constants;

global.config = config;

/* ------------ Functions for all shards: ------------ */
/**
 * Logs text to the terminal and appends it to the output.txt file.
 * @param {String} type info, warn or error
 * @param {String} origin Filename from where the text originates from
 * @param {String} str The text to log into the terminal
 * @param {Boolean} nodate Setting to true will hide date and time in the message
 * @param {Boolean} remove Setting to true will remove this message with the next one
 * @returns {String} The resulting String
 */
var logger = (type, origin, str, nodate, remove, animation) => { // Custom logger (wrapping it here so that I can pass another argument)
    if (loggedin) logafterlogin = undefined;
    require("./functions/logger.js").logger(type, origin, str, nodate, remove, animation, logafterlogin);
};
logger.animation     = require("./functions/logger.js").logger.animation;
logger.stopAnimation = require("./functions/logger.js").logger.stopAnimation;

/**
* Returns the language obj the specified server has set
* @param {Number} guildid The id of the guild
* @param {Object} guildsettings The settings of this guild
* @returns {Object} lang object callback
*/
var lang = (guildid, guildsettings) => {
    if (!guildid) {
        logger("error", "bot.js", "function lang: guildid not specified!");
        return {};
    }

    if (!guildsettings) var serverlang = constants.defaultguildsettings.lang;
        else var serverlang = guildsettings.lang;

    if (!Object.keys(bot.langObj).includes(serverlang)) {
        logger("warn", "bot.js", `Guild ${guildid} has an invalid language! Returning english language...`);
        return bot.langObj["english"];
    }

    return bot.langObj[serverlang];
};

/**
 * Adds the specified guild to the settings database with default values
 * @param {Object} guild The message.guild object
 * @param {Boolean} removeentry Removes the guild from the database
 */
var servertosettings = (guild, removeentry) => {
    require("./functions/servertosettings.js").run(bot, logger, guild, removeentry); // Call the run function of the file which contains the code of this function
};

/**
 * Attempts to get a user object from a message
 * @param {Object} message The message object
 * @param {Array} args The args array
 * @param {Number} startindex The index of the args array to start searching from
 * @param {Number} endindex The index of the args array to stop searching (won't be included) (optional)
 * @param {Boolean} allowauthorreturn Specifies if the function should return the author if no args is given
 * @param {Array} stoparguments Arguments that will stop/limit the search (basically an automatic endindex)
 * @returns The retrieved user object, undefined if nothing was found or a number >1 if more than one user was found
 */
var getuserfrommsg = (message, args, startindex, endindex, allowauthorreturn, stoparguments) => {
    return require("./functions/getuserfrommsg.js").run(message, args, startindex, endindex, allowauthorreturn, stoparguments);
};

/**
 * Attempts to get time from message and converts it into ms
 * @param {Array} args The args array
 * @param {function} [callback] Called with `time` (Number) in ms, `unitindex` (Number or null) index of time unit in lang.general.gettimefuncoptions and `arr` (Array) Array containing amount and unit Example: ["2", "minutes"] parameters on completion
 */
var gettimefrommsg = (args, callback) => {
    require("./functions/gettimefrommsg.js").run(args, (time, unitindex, arr) => { callback(time, unitindex, arr); }); // Callback the callback
};

/**
 * Attempts to get a reason from a message
 * @param {Array} args The args array
 * @param {Array} stoparguments Arguments that will stop/limit the search
 * @param {function} [callback] Called with `reason` (String or undefined) and `reasontext` or `"\"` (String) parameters on completion (reason is for Audit Log, reasontext for message)
 */
var getreasonfrommsg = (args, stoparguments, callback) => {
    require("./functions/getreasonfrommsg.js").run(args, stoparguments, (reason, reasontext) => { callback(reason, reasontext); }); // Callback the callback
};

/**
 * Sends a message to the modlogchannel of that guild if it has one set
 * @param {Discord.Guild} guild The guild obj
 * @param {String} action Type of action
 * @param {Discord.User} author Initiator of the action
 * @param {Discord.User} reciever The affected user of the action
 * @param {Array<String>} details Additional details
 */
var msgtomodlogchannel = (guild, action, author, reciever, details) => {
    require("./functions/msgtomodlogchannel.js").run(bot, logger, guild, action, author, reciever, details); // Call the run function of the file which contains the code of this function
};

/**
 * Rounds a number with x decimals
 * @param {Number} value Number to round
 * @param {Number} decimals Amount of decimals
 * @returns {Number} Rounded number
 */
var round = (value, decimals) => {
    return Number(Math.round(value+"e"+decimals)+"e-"+decimals);
};

/**
 * Returns random hex value
 * @returns {Number} Hex value
 */
var randomhex = () => {
    return Math.floor(Math.random() * 16777214) + 1;
};

/**
 * Returns a random String from an array
 * @param {Array<String>} arr An Array with Strings to choose from
 * @returns {String} A random String from the provided array
 */
var randomstring = arr => arr[Math.floor(Math.random() * arr.length)];

var owneronlyerror = (lang) => { return randomstring(lang.general.owneronlyerror) + " (Bot Owner only-Error)"; };
var usermissperm   = (lang) => { return randomstring(lang.general.usermissperm) + " (Role permission-Error)"; };


/* ------------ Run the command reader ------------ */
require("./helpers/commandReader.js").run(bot); // Function returns amount of commands (without aliases found)


/* -------------- Create lang object -------------- */
/**
 * Function to construct the language object
 * @param {String} dir Language Folder Root Path
 */
function langFiles(dir) { // Idea from https://stackoverflow.com/a/63111390/12934162
    fs.readdirSync(dir).forEach(file => {
        const absolute = path.join(dir, file);

        if (fs.statSync(absolute).isDirectory()) {
            return langFiles(absolute);
        } else {
            if (!file.includes(".json")) return; // Ignore all files that aren't .json
            let result = absolute.replace(".json", "").replace(/\\/g, "/").split("/"); // Remove file ending, convert windows \ to unix / and split path into array

            result.splice(0, 2); // Remove "bin" and "lang"
            result.splice(2, 1); // Remove category name

            if (!bot.langObj[result[0]]) bot.langObj[result[0]] = {}; // Create language key
            if (!bot.langObj[result[0]]["cmd"]) bot.langObj[result[0]]["cmd"] = {}; // Create cmd key

            try {
                if (result[1] == "commands") {
                    bot.langObj[result[0]]["cmd"][result[2]] = require(absolute.replace("bin", "."));
                } else {
                    bot.langObj[result[0]][result[1]] = require(absolute.replace("bin", "."));
                }
            } catch(err) {
                if (err) logger("warn", "bot.js", `langFiles function: lang ${result[0]} has an invalid file: ${err}`);
            }

            return;
        }
    });
}

bot.langObj = {};
langFiles("./bin/lang/"); // RECURSION TIME!


// Add functions to fn object
fn = { logger, lang, servertosettings, getuserfrommsg, gettimefrommsg, getreasonfrommsg, msgtomodlogchannel, round, randomhex, randomstring, owneronlyerror, usermissperm };
bot.fn = fn; // I need to be able to access functions from the sharding manager

process.on("unhandledRejection", (reason) => {
    logger("error", "bot.js", `Unhandled Rejection! Reason: ${reason.stack}`);
});

process.on("uncaughtException", (reason) => {
    logger("error", "bot.js", `Uncaught Exception! Reason: ${reason.stack}`);
});


/* -------------- Load databases -------------- */
const settings = new nedb("./data/settings.db"); // Initialise database
const timedbans = new nedb("./data/timedbans.db"); // Initialise database
const timedmutes = new nedb("./data/timedmutes.db"); // Initialise database
const monitorreactions = new nedb("./data/monitorreactions.db"); // Initialise database
const levelsdb = new nedb("./data/levels.db"); // Initialise database

settings.loadDatabase((err) => {
    if (err) return logger("error", "bot.js", "Error loading settings database. Error: " + err);
    logger("info", "bot.js", "Successfully loaded settings database."); // Load db content into memory
});

timedbans.loadDatabase((err) => {
    if (err) return logger("error", "bot.js", "Error loading timedbans database. Error: " + err);
    logger("info", "bot.js", "Successfully loaded timedbans database."); // Load db content into memory
});

timedmutes.loadDatabase((err) => {
    if (err) return logger("error", "bot.js", "Error loading timedmutes database. Error: " + err);
    logger("info", "bot.js", "Successfully loaded timedmutes database."); // Load db content into memory
});

monitorreactions.loadDatabase((err) => {
    if (err) return logger("error", "bot.js", "Error loading monitorreactions database. Error: " + err);
    logger("info", "bot.js", "Successfully loaded monitorreactions database."); // Load db content into memory
});

levelsdb.loadDatabase((err) => {
    if (err) return logger("error", "bot.js", "Error loading levelsdb database. Error: " + err);
    logger("info", "bot.js", "Successfully loaded levelsdb database."); // Load db content into memory
});

bot.settings = settings; // Add reference to bot obj
bot.timedbans = timedbans; // Add reference to bot obj
bot.timedmutes = timedmutes; // Add reference to bot obj
bot.monitorreactions = monitorreactions; // Add reference to bot obj
bot.levelsdb = levelsdb; // Add reference to bot obj


/* ------------ Startup: ------------ */
bot.on("ready", async function() {
    if ([...bot.guilds.cache.values()].length == 0) return logger("warn", "bot.js", "This shard has no guilds and is therefore unused!");
    var thisshard = [...bot.guilds.cache.values()][0].shard; // Get shard instance of this shard with this "workaround" because it isn't directly accessable

    // Set activity either to gameoverwrite or gamerotation[0]
    if (config.gameoverwrite != "" || (new Date().getDate() == 1 && new Date().getMonth() == 0)) {
        let game = config.gameoverwrite;
        if (new Date().getDate() == 1 && new Date().getMonth() == 0) game = "Happy Birthday beepBot!";

        bot.user.setPresence({ activities: [{ name: game, type: constants.gametypetranslation[config.gametype], url: config.gameurl }], status: config.status });
    } else {
        bot.user.setPresence({ activities: [{ name: config.gamerotation[0], type: constants.gametypetranslation[config.gametype], url: config.gameurl }], status: config.status });
    }

    // Read amount of commands found without aliases
    var commandcount = [...bot.commands.values()].filter(e => !e.info.thisisanalias).length;

    // Print last part of ready message when this is shard 0, otherwise print small ready message for this shard
    if (thisshard.id == 0) {
        if (bootstart - Number(shardArgs[2]) < 10000) { // If difference is more than 10 seconds it must be a restart
            // Finish startup messages from controller.js
            logger("", "", `> ${commandcount} commands & ${Object.keys(bot.langObj).length} languages found!`, true);
            logger("", "", "> Successfully logged in shard0!", true);
            logger("", "", "*--------------------------------------------------------------*\n ", true);
        } else {
            logger("info", "bot.js", "shard0 got restarted...", false, true);
        }
    } else {
        logger("info", "bot.js", `Successfully logged in shard${thisshard.id}!`, false, true);
    }

    loggedin = true;
    logafterlogin.forEach(e => {
        if (thisshard.id != 0 && e.includes("Successfully loaded") && e.includes("database")) return; // Check if this message is a database loaded message and don't log it again
        logger(e[0], e[1], e[2], e[3], e[4]);
    });

    bot.commandcount = commandcount; // Probably useful for a few cmds so lets just add it to the bot obj (export here so the read process is definitely finished)

    setTimeout(() => {
        logger("", "", "", true, true); // Print empty line to clear other stuff
    }, 2500);


    // Register all slash commands
    require("./helpers/registerSlashCommands.js").run(bot, logger);


    if (thisshard.id == 0) {
        // Game rotation
        if (config.gamerotateseconds <= 10) logger("warn", "controller.js", "gamerotateseconds in config is <= 10 seconds! Please increase this value to avoid possible cooldown errors/API spamming!", true);
        if (config.gameurl == "") logger("warn", "controller.js", "gameurl in config is empty and will break the bots presence!", true);
        let currentgameindex = 0;
        let lastPresenceChange = Date.now(); // This is useful because intervals can get very unprecise over time

        setInterval(() => {
            if (lastPresenceChange + (config.gamerotateseconds * 1000) > Date.now()) return; // Last change is more recent than gamerotateseconds wants

            // Refresh config cache to check if gameoverwrite got changed
            delete require.cache[require.resolve("./config.json")];
            config = require("./config.json");

            if (config.gameoverwrite != "" || (new Date().getDate() == 1 && new Date().getMonth() == 0)) { // If botowner set a game manually then only change game if the instance isn't already playing it
                let game = config.gameoverwrite;
                if (new Date().getDate() == 1 && new Date().getMonth() == 0) game = "Happy Birthday beepBot!";

                if (bot.user.presence.activities[0].name != game) {
                    bot.user.setPresence({ activities: [{ name: game, type: constants.gametypetranslation[config.gametype], url: config.gameurl }], status: config.status });
                }

                currentgameindex = 0; // Reset gameindex
                lastPresenceChange = Date.now() + 600000; // Add 10 min to reduce load a bit
                return; // Don't change anything else if botowner set a game manually
            }

            currentgameindex++; // Set here already so we can't get stuck at one index should an error occur
            if (currentgameindex == config.gamerotation.length) currentgameindex = 0; // Reset
            lastPresenceChange = Date.now();

            // Replace code in string (${})
            function processThisGame(thisgame, callback) {
                try {
                    let matches = thisgame.match(/(?<=\${\s*).*?(?=\s*})/gs); // Matches will be everything in between a "${" and "}" -> either null or array with results

                    if (matches) {
                        matches.forEach(async (e, i) => {
                            let evaled = await eval(matches[i]);
                            thisgame = thisgame.replace(`\${${e}}`, evaled);

                            if (!thisgame.includes("${")) callback(thisgame);
                        });
                    } else {
                        callback(thisgame); // Nothing to process, callback unprocessed argument
                    }

                } catch(err) {
                    logger("warn", "controller.js", `Couldn't replace gamerotation[${currentgameindex}] in gamerotationloop. Error: ${err.stack}`);
                    return;
                }
            }

            processThisGame(config.gamerotation[currentgameindex], (game) => {
                lastPresenceChange = Date.now(); // Set again to include processing time

                bot.user.setPresence({ activities: [{ name: game, type: constants.gametypetranslation[config.gametype], url: config.gameurl }], status: config.status });
            });
        }, 5000);


        // Avatar checker for christmas
        if (config.loginmode == "normal") {
            let lastxmascheck = Date.now() - 21600000; // Subtract 6 hours so that the first interval will already get executed
            var currentavatar = "";

            function checkavatar() { //eslint-disable-line
                if (new Date().getMonth() == "11") { // If month is December (getMonth counts from 0)
                    if (currentavatar == "xmas") return; // Seems to be already set to xmas

                    bot.user.setAvatar(constants.botxmasavatar)
                        .then(() => {
                            logger("info", "controller.js", "Successfully changed avatar to xmas.");
                            currentavatar = "xmas"; // Change to xmas so that the check won't run again
                            lastxmascheck = Date.now();
                        })
                        .catch((err) => { // Don't set currentavatar so that the check will run again
                            logger("warn", "controller.js", "Couldn't set xmas avatar: " + err.stack);
                            lastxmascheck = Date.now() - 19800000; // Subtract 5.5 hours so that the next check will run in half an hour
                            return;
                        });
                } else {
                    if (currentavatar == "normal") return; // Seems to be already set to normal

                    bot.user.setAvatar(constants.botdefaultavatar)
                        .then(() => {
                            logger("info", "controller.js", "Successfully changed avatar to normal.");
                            currentavatar = "normal"; // Change to normal so that the check won't run again
                            lastxmascheck = Date.now();
                        })
                        .catch((err) => { // Don't set currentavatar so that the check will run again
                            logger("warn", "controller.js", "Couldn't broadcast normal avatar change: " + err.stack);
                            lastxmascheck = Date.now() - 19800000; // Subtract 5.5 hours so that the next check will run in half an hour
                            return;
                        });
                }
            }

            setInterval(() => {
                if (lastxmascheck + 21600000 > Date.now()) return; // Last change is more recent than 6 hours
                checkavatar();
            }, 60000); // 60 seconds
        }
    }

});

/* ------------ Event Handlers: ------------ */
bot.on("guildCreate", guild => {
    require("./events/guildCreate.js").run(bot, logger, guild); // Call the run function of the file which contains the code of this event
});

bot.on("guildDelete", guild => {
    bot.shard.fetchClientValues("guilds.cache.size").then(res => { // Wait for promise
        logger("info", "bot.js", `I have been removed from: ${guild.name} (${guild.id}). I'm now in ${res} servers.`);
    });

    servertosettings(guild, true); // True argument will remove function from db
});

bot.on("guildMemberAdd", member => {
    require("./events/guildMemberAdd.js").run(bot, member); // Call the run function of the file which contains the code of this event
});

bot.on("guildMemberRemove", member => {
    require("./events/guildMemberRemove.js").run(bot, member); // Call the run function of the file which contains the code of this event
});

bot.on("interactionCreate", interaction => {
    require("./events/interactionCreate.js").run(bot, logger, interaction);
});

bot.on("messageReactionAdd", (reaction, user) => {
    require("./events/messageReactionAdd.js").run(bot, logger, reaction, user); // Call the run function of the file which contains the code of this event
});

bot.on("voiceStateUpdate", (oldstate, newstate) => {
    require("./events/voiceStateUpdate.js").run(bot, oldstate, newstate);
});

/* ------------ Message Handler: ------------ */
bot.on("messageCreate", (message) => {
    require("./events/message.js").run(bot, logger, message); // Call the run function of the file which contains the code of this event
});

logger("info", "bot.js", "Logging in...", false, true);
bot.login(); // Token is provided by the shard manager