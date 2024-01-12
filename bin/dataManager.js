/*
 * File: dataManager.js
 * Project: beepbot
 * Created Date: 2024-01-06 09:30:45
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-12 10:52:20
 * Modified By: 3urobeat
 *
 * Copyright (c) 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const fs   = require("fs");
const path = require("path");
const nedb = require("@seald-io/nedb");

const { default: Nedb } = require("@seald-io/nedb"); // eslint-disable-line
const Discord           = require("discord.js");     // eslint-disable-line

const tokens = require("../../token.json");


/**
 * Constructor - The data manager loads and stores data stored on the disk
 */
const DataManager = function() {

    // Contains configuration variables
    this.config = require("./config.json");

    // Contains various constant settings
    this.constants = require("./constants.json");

    // Settings based on if the bot was started in prod or test mode
    this.botSettings = {
        BOTNAME: "beepBot",
        BOTAVATAR: this.constants.botdefaultavatar,
        token: tokens.token,
        respawn: true
    };

    // Stores all language files supported by the bot
    this.langObj = {};


    /**
     * Stores all commands
     * @type {Discord.Collection}
     */
    this.commands;


    /**
     * Database which stores guild specific settings
     * Document structure: { guildid: string, prefix: string, lang: string, adminroles: string[], moderatorroles: string[], systemchannel: string | null, modlogfeatures: string[], greetmsg: string | null, byemsg: string | null, memberaddroles: string[], levelsystem: boolean, allownsfw: boolean }
     * @type {Nedb}
     */
    this.settings = {};

    /**
     * Database which stores bans applied through the bot
     * Document structure: { userid: string, until: number, guildid: string, authorid: string, banreason: string }
     * @type {Nedb}
     */
    this.timedbans = {};

    /**
     * Database which stores mutes applied through the bot
     * Document structure: { type: string, userid: string, until?: number, where: string, guildid: string, authorid: string, mutereason: string }
     * @type {Nedb}
     */
    this.timedmutes = {};

    /**
     * Database which stores message reactions to monitor changes of
     * Document structure: { type: string, msg: string, reaction: string, guildid: string, allowedroles: string[], until: number }
     * @type {Nedb}
     */
    this.monitorreactions = {};

    /**
     * Database which stores levelsystem data for every user
     * Document structure: { xp: number, messages: number, userid: string, guildid: string, username: string }
     * @type {Nedb}
     */
    this.levelsdb = {};


    // Load DataManager's helper files
    require("./functions/getLang.js");
    require("./functions/levelUser.js");
    require("./functions/serverToSettings.js");
    require("./helpers/commandReader.js");

};

module.exports = DataManager;


/**
 * Imports data from the disk
 */
DataManager.prototype.loadData = async function() {

    // Change botSettings to test values if bot was started in test mode
    if (this.config.loginmode === "test") {
        this.botSettings.BOTNAME   = "beepTestBot";
        this.botSettings.BOTAVATAR = this.constants.testbotdefaultavatar;
        this.botSettings.token     = tokens.testtoken;
        this.botSettings.respawn   = false;
    }


    // Load languages
    /**
     * Function to construct the language object
     * @param {string} dir Language Folder Root Path
     */
    let langFiles = (dir) => { // Idea from https://stackoverflow.com/a/63111390/12934162
        fs.readdirSync(dir).forEach((file) => {
            const absolute = path.join(dir, file);

            if (fs.statSync(absolute).isDirectory()) {
                return langFiles(absolute);
            } else {
                if (!file.includes(".json")) return; // Ignore all files that aren't .json
                let result = absolute.replace(".json", "").replace(/\\/g, "/").split("/"); // Remove file ending, convert windows \ to unix / and split path into array

                result.splice(0, 2); // Remove "bin" and "lang"
                result.splice(2, 1); // Remove category name

                if (!this.langObj[result[0]]) this.langObj[result[0]] = {}; // Create language key
                if (!this.langObj[result[0]]["cmd"]) this.langObj[result[0]]["cmd"] = {}; // Create cmd key

                try {
                    if (result[1] == "commands") {
                        this.langObj[result[0]]["cmd"][result[2]] = require(absolute.replace("bin", "."));
                    } else {
                        this.langObj[result[0]][result[1]] = require(absolute.replace("bin", "."));
                    }
                } catch(err) {
                    if (err) logger("warn", "dataManager.js", `langFiles: lang ${result[0]} has an invalid file: ${err}`);
                }

                return;
            }
        });
    };

    langFiles("./bin/lang/"); // RECURSION TIME!


    // Load commands
    this.loadCommands();


    // Load databases
    this.settings         = new nedb({ filename: "./data/settings.db", autoload: true }); // Autoload
    this.timedbans        = new nedb({ filename: "./data/timedbans.db", autoload: true });
    this.timedmutes       = new nedb({ filename: "./data/timedmutes.db", autoload: true });
    this.monitorreactions = new nedb({ filename: "./data/monitorreactions.db", autoload: true });
    this.levelsdb         = new nedb({ filename: "./data/levels.db", autoload: true });

};


/**
 * Displays some relevant warnings
 */
DataManager.prototype.checkData = function() {
    if (this.config.gamerotateseconds <= 10) logger("warn", "dataManager.js", "gamerotateseconds in config is <= 10 seconds! Please increase this value to avoid possible cooldown errors/API spamming!", true);
    if (this.config.gameurl == "") logger("warn", "dataManager.js", "gameurl in config is empty and will break the bots presence!", true);
};


/**
 * Appends a line to cmduse.txt
 * @param {string} str The string to append
 */
DataManager.prototype.appendToCmdUse = function(str) {
    let isoDate = (new Date(Date.now() - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, " ").replace(/\..+/, "");

    fs.appendFile("./bin/cmduse.txt", `\n\n[${isoDate}] ${str}\n`, (err) => {
        if (err) logger("error", "controller.js", "writing startup to cmduse.txt error: " + err);
    });
};


/* -------- Register functions to let the IntelliSense know what's going on in helper files -------- */

/**
 * Gets the language of a guild from settings
 * @param {string} guildID The guild ID to get the language of
 * @returns {Promise.<object | null>} Resolves with the correct language object or null if guildID is undefined
 */
DataManager.prototype.getLang = async function(guildID) {}; // eslint-disable-line

/**
 * Handles the xp addition and level up messages
 * @param {Discord.User} author The user who sent the message
 * @param {Discord.Guild} guild The guild of the message
 * @param {Discord.GuildChannel} channel The channel in which the message was sent
 */
DataManager.prototype.levelUser = async function(author, guild, channel) {}; // eslint-disable-line

/**
 * Takes user xp and returns their level
 * @param {number} xp The current total XP
 * @returns {number} Current level
 */
DataManager.prototype.xpToLevel = function(xp) {}; // eslint-disable-line

/**
 * Takes user level and returns their total xp
 * @param {number} level The level to get the xp of
 * @returns {number} Current total xp
 */
DataManager.prototype.levelToXp = function(level) {}; // eslint-disable-line

/**
 * Inserts a guild into settings.db with default settings
 * @param {Discord.Client} client The Discord client class
 * @param {Discord.Guild} guild The Discord guild class
 * @param {boolean} removeEntry Set to true if this function is called from guildDelete event. It will mark db entries for this server to expire in 7 days.
 * @param {boolean} reset Set to true to reset the guild's settings to default
 */
DataManager.prototype.serverToSettings = function(client, guild, removeEntry, reset) {}; // eslint-disable-line

/**
 * Reads all commands in ./bin/commands and loads them into a collection
 */
DataManager.prototype.loadCommands = function() {};
