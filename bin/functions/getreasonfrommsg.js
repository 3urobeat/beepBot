/*
 * File: getreasonfrommsg.js
 * Project: beepbot
 * Created Date: 12.02.2021 19:25:00
 * Author: 3urobeat
 *
 * Last Modified: 30.06.2023 09:44:28
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// This file contains code of the getreasonfrommsg function and is called by bot.js
// I did this to reduce the amount of lines in bot.js to make finding stuff easier.

/**
 * The getreasonfrommsg helper function
 * @param {Array} args An array of arguments the user provided
 * @param {Array} stoparguments Array of flags
 * @param {function} [callback] Called with `reason` (String or undefined) and `reasontext` or `"\"` (String) parameters on completion (reason is for Audit Log, reasontext for message)
 */
module.exports.run = (args, stoparguments, callback) => {
    var searchfor = "";
    let startindex = args.indexOf("-r") + 1;
    if (startindex == 0) return callback(undefined, "/"); // Seems like no reason was provided

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