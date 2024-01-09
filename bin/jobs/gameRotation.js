/*
 * File: gameRotation.js
 * Project: beepbot
 * Created Date: 2024-01-07 18:02:48
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-09 15:41:24
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
 * Attaches the game rotation job
 */
Controller.prototype._attachGameRotationJob = function() {

    // Game rotation
    let currentgameindex = 0;
    let lastPresenceChange = Date.now(); // This is useful because intervals can get very unprecise over time

    setInterval(() => {
        if (lastPresenceChange + (this.data.config.gamerotateseconds * 1000) > Date.now()) return; // Last change is more recent than gamerotateseconds wants

        logger("debug", "gameRotation.js", "Updating playing status of every shard...");


        // Refresh config cache to check if gameoverwrite got changed
        delete require.cache[require.resolve("../config.json")];
        this.data.config = require("../config.json");


        // Handle gameoverwrite or birthday message
        if (this.data.config.gameoverwrite != "" || (new Date().getDate() == 1 && new Date().getMonth() == 0)) { // If botowner set a game manually then only change game if the instance isn't already playing it
            let game = this.data.config.gameoverwrite;
            if (new Date().getDate() == 1 && new Date().getMonth() == 0) game = "Happy Birthday beepBot!";

            this.Manager.broadcastEval((client, context) => {
                if (client.user.presence.activities[0].name != context.game) {
                    client.user.setPresence({
                        activities: [{
                            name: context.game,
                            type: context.constants.gametypetranslation[context.config.gametype],
                            url: context.config.gameurl
                        }],
                        status: context.config.status
                    });
                }
            }, { context: { config: this.data.config, constants: this.data.constants, game: game } });

            currentgameindex = 0; // Reset gameindex
            lastPresenceChange = Date.now() + 600000; // Add 10 min to reduce load a bit
            return; // Don't change anything else if botowner set a game manually
        }


        // Handle normal game rotation
        currentgameindex++; // Set here already so we can't get stuck at one index should an error occur
        if (currentgameindex == this.data.config.gamerotation.length) currentgameindex = 0; // Reset
        lastPresenceChange = Date.now();

        // Replace code in string (${})
        let processThisGame = (thisgame, callback) => {
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
                logger("warn", "gameRotation.js", `Couldn't replace gamerotation[${currentgameindex}] in gamerotationloop. Error: ${err.stack}`);
                return;
            }
        };

        processThisGame(this.data.config.gamerotation[currentgameindex], (game) => {
            lastPresenceChange = Date.now(); // Set again to include processing time

            this.Manager.broadcastEval((client, context) => {
                client.user.setPresence({
                    activities: [{
                        name: context.game,
                        type: context.constants.gametypetranslation[context.config.gametype],
                        url: context.config.gameurl
                    }],
                    status: context.config.status
                });
            }, { context: { config: this.data.config, constants: this.data.constants, game: game } });
        });
    }, 5000);

};
