/*
 * File: handleErrors.js
 * Project: beepbot
 * Created Date: 2024-01-06 09:27:33
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-08 19:36:42
 * Modified By: 3urobeat
 *
 * Copyright (c) 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


/**
 * Internal: Handles process's unhandledRejection & uncaughtException error events.
 */
module.exports._handleErrors = function() {

    // Should keep the bot from crashing
    process.on("unhandledRejection", (reason) => {
        logger("error", "handleErrors.js", `Unhandled Rejection Error! Reason: ${reason.stack}`, true);
    });

    process.on("uncaughtException", async (reason) => {
        logger("error", "handleErrors.js", `Uncaught Exception Error! Reason: ${reason.stack}`, true);
    });

};
