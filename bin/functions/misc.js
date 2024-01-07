/*
 * File: misc.js
 * Project: beepbot
 * Created Date: 2024-01-07 21:35:24
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-07 22:06:40
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
