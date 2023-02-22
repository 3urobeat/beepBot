/*
 * File: start.js
 * Project: beepbot
 * Created Date: 06.02.2018 19:25:00
 * Author: 3urobeat
 *
 * Last Modified: 17.11.2021 19:34:38
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// This file can restart the bot without restarting the node process
var config = require("./bin/config.json");

Object.keys(require.cache).forEach(function(key) { delete require.cache[key]; }); // Clear cache of everything in case this is a restart

require(config.filetostart);