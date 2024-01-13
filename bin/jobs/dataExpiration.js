/*
 * File: dataExpiration.js
 * Project: beepbot
 * Created Date: 2024-01-06 09:45:50
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-09 11:27:23
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
 * Attaches the data expiration job. It deletes expired data (>7 days) from all databases to adhere to EU regulations
 */
Controller.prototype._attachDataExpirationJob = function() {

    // Database 7 days data expiration
    let lastDbExpirationCheck = Date.now() - 360000; // Subtract 1 hour so that the first interval will already get executed

    setInterval(() => {
        if (lastDbExpirationCheck + 360000 > Date.now()) return; // Last change is more recent than 1 hour

        // Load all dbs to get changes // TODO: THIS SUCKS (Remove when DataManager inherits from dataExpiration)
        this.data.settings.loadDatabase((err)   => { if (err) return logger("warn", "dataExpiration.js", "Error loading settings database: " + err); });
        this.data.timedbans.loadDatabase((err)  => { if (err) return logger("warn", "dataExpiration.js", "Error loading timedbans database: " + err); });
        this.data.timedmutes.loadDatabase((err) => { if (err) return logger("warn", "dataExpiration.js", "Error loading timedmutes database: " + err); });
        this.data.levelsdb.loadDatabase((err)   => { if (err) return logger("warn", "dataExpiration.js", "Error loading levelsdb database: " + err); });


        // Check all databases for expired entries and remove them
        this.data.settings.remove({ expireTimestamp: { $lte: Date.now() } }, { multi: true }, (err, num) => { // Find all entries with expireTimestamp less than now
            if (err) logger("error", "dataExpiration.js", `Error removing all settings entries that are greater than ${Date.now()}: ${err}`, true);

            if (num > 0) {
                logger("info", "dataExpiration.js", `Cleaned up settings db and removed ${num} entries!`, true);
                this.data.settings.compactDatafile();
            }
        });

        this.data.timedbans.remove({ expireTimestamp: { $lte: Date.now() } }, { multi: true }, (err, num) => { // Find all entries with expireTimestamp less than now
            if (err) logger("error", "dataExpiration.js", `Error removing all timedbans entries that are greater than ${Date.now()}: ${err}`, true);

            if (num > 0) {
                logger("info", "dataExpiration.js", `Cleaned up timedbans db and removed ${num} entries!`, true);
                this.data.timedbans.compactDatafile();
            }
        });

        this.data.timedmutes.remove({ expireTimestamp: { $lte: Date.now() } }, { multi: true }, (err, num) => { // Find all entries with expireTimestamp less than now
            if (err) logger("error", "dataExpiration.js", `Error removing all timedmutes entries that are greater than ${Date.now()}: ${err}`, true);

            if (num > 0) {
                logger("info", "dataExpiration.js", `Cleaned up timedmutes db and removed ${num} entries!`, true);
                this.data.timedmutes.compactDatafile();
            }
        });

        this.data.levelsdb.remove({ expireTimestamp: { $lte: Date.now() } }, { multi: true }, (err, num) => { // Find all entries with expireTimestamp less than now
            if (err) logger("error", "dataExpiration.js", `Error removing all levelsdb entries that are greater than ${Date.now()}: ${err}`, true);

            if (num > 0) {
                logger("info", "dataExpiration.js", `Cleaned up levelsdb db and removed ${num} entries!`, true);
                this.data.levelsdb.compactDatafile();
            }
        });

    }, 60000); // 60 seconds

};
