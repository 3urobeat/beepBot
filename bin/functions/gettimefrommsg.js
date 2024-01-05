/*
 * File: gettimefrommsg.js
 * Project: beepbot
 * Created Date: 2021-02-07 17:27:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-05 23:25:21
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// This file contains code of the gettimefrommsg function and is called by bot.js
// I did this to reduce the amount of lines in bot.js to make finding stuff easier.

/**
 * The gettimefrommsg helper function
 * @param {Array} args An array of arguments the user provided
 * @param {Function} [callback] Called with `time` (Number) in ms, `unitindex` (Number or null) index of time unit in lang.general.gettimefuncoptions and `arr` (Array) Array containing amount and unit Example: ["2", "minutes"] parameters on completion
 */
module.exports.run = (args, callback) => { //eslint-disable-line
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
