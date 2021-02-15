//This file contains code of the logger function and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

module.exports.run = (bootstart, type, origin, str, nodate, remove, logafterlogin) => { //eslint-disable-line
    const readline = require("readline")
    const fs       = require("fs")

    var str = String(str)
    if (str.toLowerCase().includes("error")) { var str = `\x1b[31m${str}\x1b[0m` }

    //Define type
    if (type == 'info') {
        var typestr = `\x1b[96mINFO`
    } else if (type == 'warn') {
        var typestr = `\x1b[31mWARN`
    } else if (type == 'error') {
        var typestr = `\x1b[31m\x1b[7mERROR\x1b[0m\x1b[31m`
    } else {
        var typestr = '' }

    //Define origin
    if (origin != "") {
        if (typestr == "") var originstr = `\x1b[96m${origin}`
        else var originstr = `${origin}` 
    } else var originstr = ''

    //Add date or don't
    if (nodate) var date = '';
        else { //Only add date to message if it gets called at least 15 sec after bootup. This makes the startup cleaner.
        if (new Date() - bootstart > 15000) var date = `\x1b[96m[${(new Date(Date.now() - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, ' ').replace(/\..+/, '')}]\x1b[0m `
            else var date = '' }

    //Add filers
    var filler1 = ""
    var filler2 = ""
    var filler3 = ""

    if (typestr != "" || originstr != "") { 
        filler1 = "["
        filler3 = "\x1b[0m] " }

    if (typestr != "" && originstr != "") {
        filler2 = " | " }

    //Put it together
    var string = `${filler1}${typestr}${filler2}${originstr}${filler3}${date}${str}`

    //Push to logafterlogin if bot isn't logged in yet to reduce clutter (logafterlogin will be undefined if shard0 is logged in (see bot.js))
    if (logafterlogin && !nodate && !remove && !string.toLowerCase().includes("error") && !string.includes("Logging in...") && originstr != "controller.js") {
        logafterlogin.push(string)
        return; }

    //Print message with remove or without
    if (remove) {
        readline.clearLine(process.stdout, 0) //0 clears entire line
        process.stdout.write(`${string}\r`)
    } else {
        readline.clearLine(process.stdout, 0)
        console.log(`${string}`) }

    //eslint-disable-next-line
    fs.appendFileSync('./output.txt', string.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '') + '\n', err => { //Regex Credit: https://github.com/Filirom1/stripcolorcodes
        if(err) console.log('logger function appendFileSync error: ' + err) }) 

    return string; //Return String, maybe it is useful for the calling file
}