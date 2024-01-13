/*
 * File: misc.js
 * Project: beepbot
 * Created Date: 2024-01-07 21:35:24
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 09:37:56
 * Modified By: 3urobeat
 *
 * Copyright (c) 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// Contains miscellaneous functions


/**
 * Rounds a number with x decimals
 * @param {number} value Number to round
 * @param {number} decimals Amount of decimals
 * @returns {number} Rounded number
 */
module.exports.round = function(value, decimals) {
    return Number(Math.round(value+"e"+decimals)+"e-"+decimals);
};


/**
 * Returns random hex value
 * @returns {number} Hex value
 */
module.exports.randomHex = function() {
    return Math.floor(Math.random() * 16777214) + 1;
};


/**
 * Returns a random String from an array
 * @param {Array<string>} arr An Array with Strings to choose from
 * @returns {string} A random String from the provided array
 */
module.exports.randomString = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};

module.exports.owneronlyerror = (lang) => { return this.randomString(lang.general.owneronlyerror) + " (Bot Owner only-Error)"; };
module.exports.usermissperm   = (lang) => { return this.randomString(lang.general.usermissperm) + " (Role permission-Error)"; };


/**
 * The getTimeFromMsg helper function
 * @param {Array} args An array of arguments the user provided
 * @param {Function} [callback] Called with `time` (Number) in ms, `unitindex` (Number or null) index of time unit in lang.general.gettimefuncoptions and `arr` (Array) Array containing amount and unit Example: ["2", "minutes"] parameters on completion
 */
module.exports.getTimeFromMsg = (args, callback) => {
    let arr = [];

    if (args.includes("-t")) {
        arr = [args[args.indexOf("-t") + 1], args[args.indexOf("-t") + 2]]; // Result example: ["2", "minutes"]
    } else if (args.includes("-time")) {
        arr = [args[args.indexOf("-time") + 1], args[args.indexOf("-time") + 2]]; // Result example: ["2", "minutes"]
    } else {
        callback(null, null, []); // Nothing found
    }

    switch (arr[1]) {
        case "second":
        case "seconds":
            callback(arr[0] * 1000, 0, arr);
            break;
        case "minute":
        case "minutes":
            callback(arr[0] * 60000, 1, arr);
            break;
        case "hour":
        case "hours":
            callback(arr[0] * 3600000, 2, arr);
            break;
        case "day":
        case "days":
            callback(arr[0] * 86400000, 3, arr);
            break;
        case "month":
        case "months":
            callback(arr[0] * 2629800000, 4, arr);
            break;
        case "year":
        case "years":
            callback(arr[0] * 31557600000, 5, arr);
            break;
        default:
            callback(null, null, arr);
    }
};
