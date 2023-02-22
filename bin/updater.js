/*
 * File: updater.js
 * Project: beepbot
 * Created Date: 19.01.2021 22:36:00
 * Author: 3urobeat
 *
 * Last Modified: 28.11.2021 18:23:46
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const download = require("download");
const fs       = require("fs");

const oldconfig = Object.assign(require("./config.json")); // Get content of old config

var logger = require("./functions/logger.js").logger; // Custom logger


const url = "https://github.com/HerrEurobeat/beepBot/archive/master.zip";
const dontdelete = [".git", "node_modules", "data", ".eslintrc.json", "beepBot.code-workspace", "changelog.txt", "nodemon.json", "output.txt"];

logger("", "", "", true);
logger("info", "updater.js", "Downloading new files...");

download(url, "./", { extract: true }).then(() => {
    // Delete old files except dontdelete
    let files = fs.readdirSync("./");

    logger("info", "updater.js", "Deleting old files...");
    files.forEach((e, i) => {
        if (!dontdelete.includes(e) && e != "beepBot-master") {
            if (fs.statSync("./" + e).isDirectory()) {
                fs.rmdirSync("./" + e, { recursive: true });
            } else {
                fs.unlinkSync("./" + e);
            }
        }

        // Continue if finished
        if (files.length == i + 1) {

            // Move new files out of directory
            let newfiles = fs.readdirSync("./beepBot-master");

            logger("info", "updater.js", "Moving new files...");
            newfiles.forEach((e, i) => {
                if (!dontdelete.includes(e)) fs.renameSync(`./beepBot-master/${e}`, `./${e}`);

                // Continue if finished
                if (newfiles.length == i + 1) {
                    fs.rmdirSync("./beepBot-master", { recursive: true });

                    // Update config to keep a few values from old config
                    logger("info", "updater.js", "Adding previous changes to new config...");

                    delete require.cache[require.resolve("./config.json")]; // Delete cache
                    let newconfig = require("./config.json");

                    newconfig.status = oldconfig.status;
                    newconfig.gametype = oldconfig.gametype;
                    newconfig.gamerotateseconds = oldconfig.gamerotateseconds;
                    newconfig.gameoverwrite = oldconfig.gameoverwrite;
                    newconfig.gameurl = oldconfig.gameurl;

                    fs.writeFile("./bin/config.json", JSON.stringify(newconfig, null, 4), (err) => {
                        if (err) logger("info", "updater.js", err.stack);
                    });

                    // Update/Install new packages according to new package.json
                    try {
                        const { exec } = require("child_process");

                        logger("info", "updater.js", "Updating with NPM...");
                        exec("npm install", (err, stdout) => { // Wanted to do it with the npm package but that didn't work out (BETA 2.8 b2)
                            if (err) {
                                logger("info", "updater.js", err);
                                return;
                            }

                            logger("info", "updater.js", `NPM Log:\n${stdout}`); // Entire log

                            // Finished
                            logger("info", "updater.js", "Finished updating. Please restart manually.");
                        });
                    } catch (err) {
                        logger("info", "updater.js", "update npm packages Error: " + err);
                    }
                }
            });
        }
    });
}).catch((err) => {
    if (err) return logger("info", "updater.js", "Error while trying to download: " + err.stack);
});