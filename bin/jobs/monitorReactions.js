/*
 * File: monitorReactions.js
 * Project: beepbot
 * Created Date: 2024-01-06 09:41:06
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-09 13:01:24
 * Modified By: 3urobeat
 *
 * Copyright (c) 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Controller = require("../controller.js");


/**
 * Attaches the monitor reaction job to remove obsolete data from monitorreactions database
 */
Controller.prototype._attachMonitorReactionsJob = function() {

    // Check if there are obsolete monitorreactions db entries
    /* this.data.monitorreactions.loadDatabase((err) => { // Needs to be loaded with each iteration so that changes get loaded
        if (err) return logger("error", "monitorReactions.js", "Error loading timedbans database: " + err);

        this.data.monitorreactions.remove({ until: { $lte: Date.now() } }, {}, (err, num) => { // Until is a date in ms, so we remove all entries that are greater than right now
            if (err) logger("error", "monitorReactions.js", `Error removing all monitorreactions entries that are greater than ${Date.now()}: ${err}`, true);

            if (num > 0) {
                logger("info", "monitorReactions.js", `Cleaned up monitorreactions db and removed ${num} entries!`, true);
                this.data.monitorreactions.compactDatafile(); // Compact db so that the starting bot instances don't read old data
            }
        });
    }); */

};
