/*
 * File: gameRotation.js
 * Project: beepbot
 * Created Date: 2024-01-07 18:02:48
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-07 18:04:38
 * Modified By: 3urobeat
 *
 * Copyright (c) 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */



// Game rotation
let currentgameindex = 0;
let lastPresenceChange = Date.now(); // This is useful because intervals can get very unprecise over time

setInterval(() => {
    if (lastPresenceChange + (config.gamerotateseconds * 1000) > Date.now()) return; // Last change is more recent than gamerotateseconds wants

    // Refresh config cache to check if gameoverwrite got changed
    delete require.cache[require.resolve("./config.json")];
    config = require("./config.json");

    if (config.gameoverwrite != "" || (new Date().getDate() == 1 && new Date().getMonth() == 0)) { // If botowner set a game manually then only change game if the instance isn't already playing it
        let game = config.gameoverwrite;
        if (new Date().getDate() == 1 && new Date().getMonth() == 0) game = "Happy Birthday beepBot!";

        if (this.client.user.presence.activities[0].name != game) {
            this.client.user.setPresence({ activities: [{ name: game, type: constants.gametypetranslation[config.gametype], url: config.gameurl }], status: config.status });
        }

        currentgameindex = 0; // Reset gameindex
        lastPresenceChange = Date.now() + 600000; // Add 10 min to reduce load a bit
        return; // Don't change anything else if botowner set a game manually
    }

    currentgameindex++; // Set here already so we can't get stuck at one index should an error occur
    if (currentgameindex == config.gamerotation.length) currentgameindex = 0; // Reset
    lastPresenceChange = Date.now();

    // Replace code in string (${})
    function processThisGame(thisgame, callback) {
        try {
            let matches = thisgame.match(/(?<=\${\s*).*?(?=\s*})/gs); // Matches will be everything in between a "${" and "}" -> either null or array with results

            if (matches) {
                matches.forEach(async (e, i) => {
                    let evaled = await eval(matches[i]);
                    thisgame = thisgame.replace(`\${${e}}`, evaled);

                    if (!thisgame.includes("${")) callback(thisgame);
                });
            } else {
                callback(thisgame); // Nothing to process, callback unprocessed argument
            }

        } catch(err) {
            logger("warn", "controller.js", `Couldn't replace gamerotation[${currentgameindex}] in gamerotationloop. Error: ${err.stack}`);
            return;
        }
    }

    processThisGame(config.gamerotation[currentgameindex], (game) => {
        lastPresenceChange = Date.now(); // Set again to include processing time

        this.client.user.setPresence({ activities: [{ name: game, type: constants.gametypetranslation[config.gametype], url: config.gameurl }], status: config.status });
    });
}, 5000);
