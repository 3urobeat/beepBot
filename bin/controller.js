/*
 * File: controller.js
 * Project: beepbot
 * Created Date: 2020-10-01 18:53:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-09 16:03:37
 * Modified By: 3urobeat
 *
 * Copyright (c) 2020 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js");
const logger  = require("output-logger"); // Look Mom, it's my own library!

const DataManager = require("./dataManager.js");
const ascii       = require("./ascii.js");

// Const { _handleErrors } = require("./helpers/handleErrors.js");


const Controller = function() {

    // Attach error handler
    // _handleErrors(); // Error handler attached in bot.js seems to be enough when in mode worker

    /**
     * @type {Discord.ShardingManager}
     */
    this.Manager;

    /**
     * Collection of all shards currently spawned
     */
    this.shards = [];

    /**
     * @type {DataManager}
     */
    this.data = new DataManager();


    // Load Controller's helper files
    require("./helpers/handleErrors.js");
    require("./jobs/avatarCheck.js");
    require("./jobs/dataExpiration.js");
    require("./jobs/gameRotation.js");
    require("./jobs/monitorReactions.js");
    require("./jobs/tempMod.js");

};

module.exports = Controller;


/**
 * Starts the bot
 */
Controller.prototype.start = async function() {

    // Configure my logging library (https://github.com/3urobeat/output-logger#options-1)
    logger.options({
        msgstructure: `[${logger.Const.ANIMATION}] [${logger.Const.TYPE} | ${logger.Const.ORIGIN}] [${logger.Const.DATE}] ${logger.Const.MESSAGE}`,
        paramstructure: [logger.Const.TYPE, logger.Const.ORIGIN, logger.Const.MESSAGE, "nodate", "remove", logger.Const.ANIMATION],
        outputfile: "./output.txt",
        animationdelay: 250,
        printdebug: this.data.config.printDebug
    });

    global.logger = logger;


    // Print startup messages
    const randomstring = arr => arr[Math.floor(Math.random() * arr.length)];
    const asciiStr = randomstring(ascii);

    logger("", "", "", true, true);
    logger("info", "controller.js", "Initiating bootup sequence...");
    logger("", "", `\n${asciiStr}\n`, true);
    logger("info", "controller.js", "Loading...", true, false, logger.animation("loading"));


    /* -------------- Import data -------------- */
    await this.data.loadData();

    this.data.checkData();


    // Log the startup in the cmduse.txt file
    this.data.appendToCmdUse(`Starting beepBot version ${this.data.config.version} in ${this.data.config.loginmode} mode`);


    // Set process title
    if (process.platform == "win32") { // Set node process name to find it in task manager etc.
        process.title = `3urobeat's beepBot v${this.data.config.version} | ${process.platform}`; // Windows allows long terminal/process names
    } else {
        process.stdout.write(`${String.fromCharCode(27)}]0;3urobeat's beepBot v${this.data.config.version} | ${process.platform}${String.fromCharCode(7)}`); // Sets terminal title (thanks: https://stackoverflow.com/a/30360821/12934162)
        process.title = "beepBot"; // Sets process title in task manager etc.
    }


    /* -------------- Start needed shards -------------- */
    this.Manager = new Discord.ShardingManager("./bin/bot.js", {
        mode: "worker", // Lets me share the nedb instances in the current configuration
        totalShards: 3,
        token: this.data.botSettings.token,
        respawn: this.data.botSettings.respawn
    });


    /* -------------- shardCreate Event -------------- */
    this.Manager.on("shardCreate", (shard) => {
        logger("info", "controller.js", `Spawned shard ${shard.id}!`, false, true);

        // Log ready message once
        if (shard.id != 0) return;

        setTimeout(() => {

            logger("", "", "\n*---------=----------[\x1b[96mINFO | controller.js\x1b[0m]---------=----------*", true);
            logger("", "", `> Started ${this.data.botSettings.BOTNAME} ${this.data.config.version} by 3urobeat`, true);

            if (this.data.config.shards > 1) {
                logger(`> ${this.data.config.shards} shards running in \x1b[32m${this.data.config.loginmode}\x1b[0m mode on ${process.platform}`, true);
            } else {
                logger("", "", `> Running in \x1b[32m${this.data.config.loginmode}\x1b[0m mode on ${process.platform}.`, true);
            }

            if (this.Manager.totalShards == "auto") {
                logger("", "", "> ShardManager is running in automatic mode...", true);
            } else {
                logger("", "", `> ShardManager is running with ${this.Manager.totalShards} shards...`, true);
            }


            // Lengthy switch case for a simple log color ughhh heeree wee goo
            let status;

            switch(this.data.config.status) {
                case "online":
                    status = "\x1b[32monline\x1b[0m";
                    break;
                case "idle":
                    status = "\x1b[33midle\x1b[0m";
                    break;
                case "dnd":
                    status = "\x1b[91mdnd\x1b[0m";
                    break;
                default:
                    logger("warn", "controller.js", `Unsupported status type in config '${this.data.config.status}'!`);
                    status = this.data.config.status;
            }

            logger("", "", `> Set Presence to ${status} - Game Rotation every ${this.data.config.gamerotateseconds} sec`, true);

            // End line is located in ready event in bot.js and will be logged by shard 0


            // Attach jobs
            this._attachAvatarCheckJob();
            this._attachDataExpirationJob();
            this._attachGameRotationJob();
            this._attachMonitorReactionsJob();
            this._attachTempModJob();

        }, 500);
    });


    this.Manager.spawn({ amount: this.Manager.totalShards }).catch(err => { // Respawn delay is 10000
        logger("error", "controller.js", `Failed to start shard: ${err.stack}`);
    });

};


/* -------- Register functions to let the IntelliSense know what's going on in helper files -------- */
/**
 * Attaches the christmas avatar check job
 */
Controller.prototype._attachAvatarCheckJob = function() {};

/**
 * Attaches the data expiration job. It deletes expired data (>7 days) from all databases to adhere to EU regulations
 */
Controller.prototype._attachDataExpirationJob = function() {};

/**
 * Attaches the game rotation job
 */
Controller.prototype._attachGameRotationJob = function() {};

/**
 * Attaches the monitor reaction job to remove obsolete data from monitorreactions database
 */
Controller.prototype._attachMonitorReactionsJob = function() {};

/**
 * Attaches jobs for lifting temporary mod actions, like mutes and bans
 */
Controller.prototype._attachTempModJob = function() {};
