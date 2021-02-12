const download = require("download")
const fs = require("fs")
const oldconfig = Object.assign(require("./config.json")) //get content of old config
var logger = (type, origin, str, nodate, remove) => { //Custom logger
    return require("./functions/logger.js").run(0, type, origin, str, nodate, remove) } //call the run function of the file which contains the code of this function

const url = 'https://github.com/HerrEurobeat/beepBot/archive/master.zip';
const dontdelete = [".git", "node_modules", "data", ".eslintrc.json", "beepBot.code-workspace", "changelog.txt", "nodemon.json", "output.txt"]

logger("", "", "", true)
logger("info", "updater.js", "Downloading new files...")

download(url, "./", { extract: true }).then(() => {
    //Delete old files except dontdelete
    let files = fs.readdirSync("./")

    logger("info", "updater.js", "Deleting old files...")
    files.forEach((e, i) => {
        if (!dontdelete.includes(e) && e != "beepBot-master") {
            if (fs.statSync("./" + e).isDirectory()) fs.rmdirSync("./" + e, { recursive: true })
                else fs.unlinkSync("./" + e) }

        //Continue if finished
        if (files.length == i + 1) {

            //Move new files out of directory
            let newfiles = fs.readdirSync("./beepBot-master")

            logger("info", "updater.js", "Moving new files...")
            newfiles.forEach((e, i) => {
                if (!dontdelete.includes(e)) fs.renameSync(`./beepBot-master/${e}`, `./${e}`)

                //Continue if finished
                if (newfiles.length == i + 1) {
                    fs.rmdirSync("./beepBot-master", { recursive: true })

                    //Update config to keep a few values from old config
                    logger("info", "updater.js", "Adding previous changes to new config...")

                    delete require.cache[require.resolve("./config.json")] //delete cache
                    let newconfig = require("./config.json")

                    newconfig.status = oldconfig.status
                    newconfig.gametype = oldconfig.gametype
                    newconfig.gamerotateseconds = oldconfig.gamerotateseconds
                    newconfig.gameoverwrite = oldconfig.gameoverwrite
                    newconfig.gameurl = oldconfig.gameurl

                    fs.writeFile("./bin/config.json", JSON.stringify(newconfig, null, 4), (err) => {
                        if (err) logger("info", "updater.js", err.stack) })

                    //Update/Install new packages according to new package.json
                    try {
                        const { exec } = require('child_process');

                        logger("info", "updater.js", "Updating with NPM...")
                        exec('npm install', (err, stdout) => { //wanted to do it with the npm package but that didn't work out (BETA 2.8 b2)
                            if (err) {
                                logger("info", "updater.js", err)
                                return; }

                                logger("info", "updater.js", `NPM Log:\n${stdout}`) //entire log

                            //Finished
                            logger("info", "updater.js", "Finished updating. Please restart manually.") })
                    } catch (err) { logger("info", "updater.js", 'update npm packages Error: ' + err) } }
                })
        } }) })
    .catch((err) => {
        if (err) return logger("info", "updater.js", "Error while trying to download: " + err.stack) })