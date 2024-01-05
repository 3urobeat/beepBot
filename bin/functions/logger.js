/*
 * File: logger.js
 * Project: beepbot
 * Created Date: 2021-02-07 17:27:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-05 23:24:44
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// This file contains code of the logger function and is called by bot.js
// I did this to reduce the amount of lines in bot.js to make finding stuff easier.


const outputlogger = require("output-logger");


/**
 * Logs text to the terminal and appends it to the output.txt file.
 * @param {string} type String that determines the type of the log message. Can be info, warn, error, debug or an empty string to not use the field.
 * @param {string} origin The origin file
 * @param {string} str The text to log into the terminal
 * @param {boolean} nodate Setting to true will hide date and time in the message
 * @param {boolean} remove Setting to true will remove this message with the next one
 * @param animation
 * @param {boolean} logafterlogin Defines if the message should be logged after login
 */
module.exports.logger = (type, origin, str, nodate, remove, animation, logafterlogin) => { // Function that passes args to my logger library and just exists to handle readyafterlogs atm

    // Configure my logging library (https://github.com/3urobeat/output-logger#options-1)
    outputlogger.options({
        msgstructure: `[${outputlogger.Const.ANIMATION}] [${outputlogger.Const.TYPE} | ${outputlogger.Const.ORIGIN}] [${outputlogger.Const.DATE}] ${outputlogger.Const.MESSAGE}`,
        paramstructure: [outputlogger.Const.TYPE, outputlogger.Const.ORIGIN, outputlogger.Const.MESSAGE, "nodate", "remove", outputlogger.Const.ANIMATION],
        outputfile: "./output.txt",
        animationdelay: 250,
        printdebug: false
    });

    // Push to logafterlogin if bot isn't logged in yet to reduce clutter (logafterlogin will be undefined if shard0 is logged in (see bot.js))
    if (logafterlogin && !nodate && !remove && !str.toLowerCase().includes("error") && !str.includes("Logging in...") && origin != "controller.js") {
        logafterlogin.push([ type, origin, str, nodate, remove, animation ]);
        return;
    } else {
        outputlogger(type, origin, str, nodate, remove, animation);
    }
};


/**
 * Returns one of the default animations
 * @param {string} animation Valid animations: `loading`, `waiting`, `bounce`, `progress`, `arrows` or `bouncearrows`
 * @param args
 * @returns Array of the chosen animation
 */
module.exports.logger.animation = (args) => {
    return outputlogger.animation(args);
};


/**
 * Stops any animation currently active
 */
module.exports.logger.stopAnimation = () => {
    return outputlogger.stopAnimation;
};
