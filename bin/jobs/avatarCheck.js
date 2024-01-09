/*
 * File: avatarCheck.js
 * Project: beepbot
 * Created Date: 2024-01-07 18:02:55
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-09 15:42:58
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
 * Attaches the christmas avatar check job
 */
Controller.prototype._attachAvatarCheckJob = function() {

    // Avatar checker for christmas
    if (this.data.config.loginmode == "normal") {
        let lastxmascheck = Date.now() - 21600000; // Subtract 6 hours so that the first interval will already get executed
        let currentavatar = "";

        let checkavatar = () => { // Must be an ES6 function to not create a new context
            if (new Date().getMonth() == "11") { // If month is December (getMonth counts from 0)
                if (currentavatar == "xmas") return; // Seems to be already set to xmas

                this.Manager.broadcastEval((client, context) => {
                    client.user.setAvatar(context.constants.botxmasavatar)
                        .then(() => {
                            logger("info", "avatarCheck.js", "Successfully changed avatar to xmas.");
                            currentavatar = "xmas"; // Change to xmas so that the check won't run again
                            lastxmascheck = Date.now();
                        })
                        .catch((err) => { // Don't set currentavatar so that the check will run again
                            logger("warn", "avatarCheck.js", "Couldn't set xmas avatar: " + err.stack);
                            lastxmascheck = Date.now() - 19800000; // Subtract 5.5 hours so that the next check will run in half an hour
                            return;
                        });
                }, { context: { constants: this.data.constants } });

            } else {

                if (currentavatar == "normal") return; // Seems to be already set to normal

                this.Manager.broadcastEval((client, context) => {
                    client.user.setAvatar(context.constants.botdefaultavatar)
                        .then(() => {
                            logger("info", "avatarCheck.js", "Successfully changed avatar to normal.");
                            currentavatar = "normal"; // Change to normal so that the check won't run again
                            lastxmascheck = Date.now();
                        })
                        .catch((err) => { // Don't set currentavatar so that the check will run again
                            logger("warn", "avatarCheck.js", "Couldn't broadcast normal avatar change: " + err.stack);
                            lastxmascheck = Date.now() - 19800000; // Subtract 5.5 hours so that the next check will run in half an hour
                            return;
                        });
                }, { context: { constants: this.data.constants } });
            }
        };

        setInterval(() => {
            if (lastxmascheck + 21600000 > Date.now()) return; // Last change is more recent than 6 hours

            logger("debug", "avatarCheck.js", "Checking seasonal avatar...");

            checkavatar();
        }, 60000); // 60 seconds
    }

};
