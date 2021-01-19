const download = require("download")
const fs = require("fs")
const oldconfig = Object.assign(require("./config.json")) //get content of old config

const url = 'https://github.com/HerrEurobeat/beepBot/archive/master.zip';
const dontdelete = [".git", "node_modules", "data", ".eslintrc.json", "beepBot.code-workspace", "changelog.txt", "nodemon.json", "output.txt"]

//Delete old files except dontdelete
let files = fs.readdirSync("./")

console.log("Deleting old files...")
files.forEach((e, i) => {
    if (!dontdelete.includes(e)) {
        if (fs.statSync("./" + e).isDirectory()) fs.rmdirSync("./" + e, { recursive: true })
            else fs.unlinkSync("./" + e) }

    //Continue if finished
    if (files.length == i + 1) {
        console.log("Downloading new files...")
        download(url, "./", { extract: true }).then(() => {

            //Move new files out of directory
            let newfiles = fs.readdirSync("./beepBot-master")

            console.log("Moving new files...")
            newfiles.forEach((e, i) => {
                fs.renameSync(`./beepBot-master/${e}`, `./${e}`)

                //Continue if finished
                if (newfiles.length == i + 1) {
                    fs.rmdirSync("./beepBot-master")

                    //Update config to keep a few values from old config
                    console.log("Adding previous changes to new config...")

                    delete require.cache[require.resolve("./config.json")] //delete cache
                    let newconfig = require("./config.json")

                    newconfig.status = oldconfig.status
                    newconfig.gametype = oldconfig.gametype
                    newconfig.gamerotateseconds = oldconfig.gamerotateseconds
                    newconfig.gameoverwrite = oldconfig.gameoverwrite
                    newconfig.gameurl = oldconfig.gameurl

                    fs.writeFile("./bin/config.json", JSON.stringify(newconfig, null, 4), (err) => {
                        if (err) console.log(err.stack) })

                    //Update/Install new packages according to new package.json
                    try {
                        const { exec } = require('child_process');

                        console.log("Updating with NPM...")
                        exec('npm install', (err, stdout) => { //wanted to do it with the npm package but that didn't work out (BETA 2.8 b2)
                            if (err) {
                                console.log(err)
                                return; }

                            console.log(`NPM Log:\n${stdout}`) //entire log

                            //Finished
                            /* setTimeout(() => {
                                
                            }, 5000); */ })
                    } catch (err) { console.log('update npm packages Error: ' + err) } }
                }) })
    } })