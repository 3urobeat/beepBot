/*
 * File: getReasonFromMsg.js
 * Project: beepbot
 * Created Date: 2021-02-12 19:25:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-12 16:50:12
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Bot = require("../bot.js");


/**
 * The getReasonFromMsg helper function
 * @param {Array} args An array of arguments the user provided
 * @param {Array} stoparguments Array of flags
 * @param {Function} [callback] Called with `reason` (String or null) and `reasontext` or `"\"` (String) parameters on completion (reason is for Audit Log, reasontext for message)
 */
Bot.prototype.getReasonFromMsg = function(args, stoparguments, callback) {
    let searchfor = "";
    let startindex = args.indexOf("-r") + 1;
    if (startindex == 0) return callback(null, "/"); // Seems like no reason was provided

    args.every((e, i) => {
        if (i < startindex) return true; // We don't need to start yet so lets skip the iteration

        if (searchfor.length > 0) searchfor += ` ${e}`; // If there is already something in the string add a space infront this entry
            else searchfor += e;

        if (stoparguments.includes(args[i + 1]) || i + 1 > args.length - 1) { // Check if next iteration would match a stoparg or it would exceed the array length
            callback(searchfor, searchfor);

            return false; // Stop loop
        } else {
            return true; // Continue with next iteration
        }
    });
};
