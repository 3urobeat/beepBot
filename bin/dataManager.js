/*
 * File: dataManager.js
 * Project: beepbot
 * Created Date: 2024-01-06 09:30:45
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-07 17:03:40
 * Modified By: 3urobeat
 *
 * Copyright (c) 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const fs   = require("fs");
const nedb = require("@seald-io/nedb");

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

    // Load databases
    this.settings         = new nedb({ filename: "./data/settings.db", autoload: true }); // Autoload
    this.timedbans        = new nedb({ filename: "./data/timedbans.db", autoload: true });
    this.timedmutes       = new nedb({ filename: "./data/timedmutes.db", autoload: true });
    this.monitorreactions = new nedb({ filename: "./data/monitorreactions.db", autoload: true });
    this.levelsdb         = new nedb({ filename: "./data/levels.db", autoload: true });

};


/**
 * Appends a line to cmduse.txt
 * @param {string} str The string to append
 */
DataManager.prototype.appendToCmdUse = function(str) {
    fs.appendFile("./bin/cmduse.txt", `\n\n[${(new Date(Date.now() - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, " ").replace(/\..+/, "")}] ${str}\n`, (err) => {
        if (err) logger("error", "controller.js", "writing startup to cmduse.txt error: " + err);
    });
};
