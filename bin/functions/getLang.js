/*
 * File: getLang.js
 * Project: beepbot
 * Created Date: 2024-01-07 16:47:19
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-07 17:20:30
 * Modified By: 3urobeat
 *
 * Copyright (c) 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const DataManager = require("../dataManager.js");


/**
 * Gets the language of a guild from settings
 * @param {string} guildID The guild ID to get the language of
 * @returns {Promise.<object | null>} Resolves with guildSettings object or defaultSettings. On error, null is returned.
 */
DataManager.prototype.getLang = async function(guildID) {

    if (!guildID) {
        logger("error", "getLang.js", "Error: guildID must not be null!");
        return null;
    }

    // Attempt to find guild in settings database
    let settings = await this.settings.findOneAsync({ guildid: guildID });

    // Return default settings if no record was found or an invalid language was set
    if (!settings || !Object.keys(this.langObj).includes(settings.lang)) {
        logger("warn", "getLang.js", `Guild ${guildID} has no or an invalid language set! Returning english language...`);

        return this.langObj["english"];
    } else {
        return this.langObj[settings.lang];
    }

};
