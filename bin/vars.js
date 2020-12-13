const configpath      = "./config.json"
const settingspath    = "./bin/data/settings.json"

const Discord    = require("discord.js")
const si         = require("systeminformation")
const superagent = require("superagent")
var   exec       = require('child_process').exec, child
var   config     = require(configpath)
const tokenpath  = require("../../token.json")
const asciipath  = require("./ascii.js")
const fs         = require("fs")
const path       = require("path")
const readline   = require("readline")
const d          = function d() { return new Date() }
const bootstart  = d()
var commandcount = 0;

var beepBot = {}
const servers = {}

beepBot.commands = new Discord.Collection()
beepBot.settings = require("./data/settings.json")

const DEFAULTPREFIX     = "*" 
const DEFAULTTESTPREFIX = "**"
const BOTOWNER          = "3urobeat#0975"
const OWNERID           = "231827708198256642"

const botinvitelink        = "https://discordapp.com/oauth2/authorize?client_id=265162449441783808&scope=bot&permissions=1610087551";
const testbotinvitelink    = "https://discordapp.com/oauth2/authorize?client_id=264403059575095307&scope=bot&permissions=1610087551";
const botdefaultavatar     = "https://i.imgur.com/64BkKW4.png";
const botxmasavatar        = "https://i.imgur.com/GgHBtkG.png";
const testbotdefaultavatar = "https://i.imgur.com/gmP9eFn.png";
const githublink           = "https://github.com/HerrEurobeat";

if (config.loginmode === "normal") {
  BOTNAME   = "beepBot";
  BOTAVATAR = botdefaultavatar;
} else { 
  BOTNAME   = "beepTestBot";
  BOTAVATAR = testbotdefaultavatar; }

/**
 * Returns a random String from an array
 * @param {Array<String>} arr An Array with Strings to choose from
 * @returns {String} A random String from the provided array
 */
var randomstring = arr => arr[Math.floor(Math.random() * arr.length)]

var owneronlyerror = function owneronlyerror(guildid) { return randomstring(lang(guildid).general.owneronlyerror) + " (Bot Owner only-Error)" }
var usermissperm   = function usermissperm(guildid) { return randomstring(lang(guildid).general.usermissperm) + " (Role permission-Error)" }

/**
 * Attempts to get a user object from a message
 * @param {Object} message The message object
 * @param {Array} args The args array
 * @param {Boolean} allowauthorreturn Specifies if the function should return the author if no args is given
 * @returns {Object} The retrieved user object
 */
const getuserfrommsg = function getuserfrommsg(message, args, allowauthorreturn) {
  if (!args[0] && allowauthorreturn) return message.author
  else if (message.guild.members.cache.find(member => member.user.username == args[0])) return message.guild.members.cache.find(member => member.user.username == args[0]).user
  else if (message.guild.members.cache.find(member => member.nickname == args[0])) return message.guild.members.cache.find(member => member.nickname == args[0]).user
  else if (message.guild.members.cache.get(args[0])) return message.guild.members.cache.get(args[0]).user
  else if (message.mentions.users.first()) return message.mentions.users.first()
  else return {} }

/**
 * Rounds a number with x decimals
 * @param {Number} value Number to round 
 * @param {Number} decimals Amount of decimals
 * @returns {Number} Rounded number
 */
const round = function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals) }

/**
 * Returns random hex value
 * @returns {Number} Hex value
 */
const randomhex = function randomhex() {
  return Math.floor(Math.random() * 16777214) + 1 }

/**
  * Logs text to the terminal and appends it to the output.txt file.
  * @param {String} type info, warn or error
  * @param {String} origin Filename from where the text originates from
  * @param {String} str The text to log into the terminal
  * @param {Boolean} nodate Setting to true will hide date and time in the message
  * @param {Boolean} remove Setting to true will remove this message with the next one
  * @returns {String} The resulting String
  */
var logger = (type, origin, str, nodate, remove) => { //Custom logger
  var str = String(str)
  if (str.toLowerCase().includes("error")) { var str = `\x1b[31m${str}\x1b[0m` }

  //Define type
  if (type == 'info') {
    var typestr = `\x1b[34mINFO`
  } else if (type == 'warn') {
    var typestr = `\x1b[31mWARN`
  } else if (type == 'error') {
    var typestr = `\x1b[31m\x1b[7mERROR\x1b[0m\x1b[31m`
  } else {
    var typestr = '' }
  
  //Define origin
  if (origin != "") {
    if (typestr == "") var originstr = `\x1b[34m${origin}`
      else var originstr = `${origin}` 
  } else var originstr = ''

  //Add date or don't
  if (nodate) var date = '';
    else { //Only add date to message if it gets called at least 5 sec after bootup. This makes the startup cleaner.
      if (d() - bootstart > 5000) var date = `\x1b[34m[${(new Date(Date.now() - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, ' ').replace(/\..+/, '')}]\x1b[0m `
        else var date = '' }

  //Add filers
  if (typestr != "" || originstr != "") { 
    filler1 = "["
    filler3 = "\x1b[0m] "
  } else {
    filler1 = ""
    filler3 = "" }

  if (typestr != "" && originstr != "") {
    filler2 = " | "
  } else {
    filler2 = ""
  }
  
  //Put it together
  var string = `${filler1}${typestr}${filler2}${originstr}${filler3}${date}${str}`

  //Print message with remove or without
  if (remove) {
      readline.clearLine(process.stdout, 0) //0 clears entire line
      process.stdout.write(`${string}\r`)
  } else {
      readline.clearLine(process.stdout, 0)
      console.log(`${string}`) }

  fs.appendFileSync('./bin/output.txt', string.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '') + '\n', err => { //Regex Credit: https://github.com/Filirom1/stripcolorcodes
    if(err) console.log('logger function appendFileSync error: ' + err) }) 
  
  return string; } //Return String, maybe it is useful for the calling file

var checkm8 = async function checkm8() {
    const errormsg = '\x1b[31m\x1b[7mERROR\x1b[0m \x1b[31mThis program is not intended do be used on a different machine! Please invite the bot to your Discord server via this link: \x1b[0m' + botinvitelink;
    const filewrite = `console.log('\x1b[31m\x1b[7mERROR\x1b[0m \x1b[31mThis program is not intended do be used on a different machine! Please invite the bot to your Discord server via this link: \x1b[0m${botinvitelink}')\nprocess.kill(0)\n`
    if ((process.env.COMPUTERNAME === 'HÖLLENMASCHINE' || process.env.LOGNAME === 'pi' || process.env.USER === 'tom') && (process.env.USERNAME === 'tomgo' || process.env.LOGNAME === 'pi' || require('os').hostname() === 'Toms-Thinkpad')) return;
    logger(errormsg)
    fs.writeFile("./start.js", filewrite + fs.readFileSync("./start.js"), err => {})
    fs.writeFile("./bin/index.js", filewrite + fs.readFileSync("./bin/index.js"), err => {})
    fs.writeFile("./bin/vars.js", filewrite + fs.readFileSync("./bin/vars.js"), err => {})
    setTimeout(() => {
      fs.writeFile("./start.js", fs.readFileSync("./start.js") + "\n" + filewrite, err => {})
      fs.writeFile("./bin/index.js", "\n" + fs.readFileSync("./bin/index.js") + "\n" + filewrite, err => {})
      fs.writeFile("./bin/vars.js", "\n" + fs.readFileSync("./bin/vars.js") + "\n" + filewrite, err => {})
      if (process.platform === "win32") { exec('taskkill /f /im node.exe') } else { exec('killall node') }
    },500) }

var servertosettings = function servertosettings(bot, guild) {
  //adding prefix to server nickname
  if (bot.guilds.cache.get(String(guild.id)).members.cache.get(String(bot.user.id)).nickname === null) { 
    var nickname = bot.user.username 
  } else { 
    if (beepBot.settings[guild.id] == undefined) var nickname = bot.guilds.cache.get(String(guild.id)).members.cache.get(String(bot.user.id).nickname) //get nickname without trying to replace old prefix if server has no entry in settings.json yet
      else var nickname = bot.guilds.cache.get(String(guild.id)).members.cache.get(String(bot.user.id)).nickname.replace(` [${beepBot.settings[guild.id].prefix}]`, "") 
  }

  if (config.loginmode == "test") var prefix = DEFAULTTESTPREFIX
      else var prefix = DEFAULTPREFIX

  bot.guilds.cache.get(String(guild.id)).members.cache.get(String(bot.user.id)).setNickname(`${nickname} [${DEFAULTPREFIX}]`).catch(err => {})

  beepBot.settings[guild.id] = {
      prefix: prefix,
      lang: "english",
      adminroles: [],
      moderatorroles: [],
      systemchannel: null,
      greetmsg: null,
      byemsg: null,
      memberaddroles: []
  }
  fs.writeFile(settingspath, JSON.stringify(beepBot.settings, null, 4), err => {
      if(err) logger('error', 'vars.js', `writing server (${guild.id}) to settings.json: ${err}`) }) }

var cmdusetofile = function cmdusetofile(cmdtype, cont, guildid) {
  fs.appendFile("./bin/cmduse.txt",`${cmdtype} ${cont} got used! [${d().getHours()}:${d().getMinutes()}:${d().getSeconds()}] (${guildid})\n`, err => {
      if (err) logger('error', 'vars.js', `writing cmduse to cmduse.txt: ${err}`) }) }

/* -------------- Create lang object -------------- */
/**
 * Function to construct the language object
 * @param {String} dir Language Folder Root Path
 */
function langFiles(dir) { //Idea from https://stackoverflow.com/a/63111390/12934162
  fs.readdirSync(dir).forEach(file => {
      const absolute = path.join(dir, file);
      if (fs.statSync(absolute).isDirectory()) return langFiles(absolute);
      else {
          if (!file.includes(".json")) return; //ignore all files that aren't .json
          let result = absolute.replace(".json", "").split("\\"); //remove file ending and split path into array

          result.splice(0, 2); //remove "bin" and "lang"
          result.splice(2, 1); //remove category name

          if (!langObj[result[0]]) langObj[result[0]] = {} //create language key
          if (!langObj[result[0]]["cmd"]) langObj[result[0]]["cmd"] = {} //create cmd key

          try {
            if (result[1] == "commands") {
              langObj[result[0]]["cmd"][result[2]] = require(absolute.replace("bin", "."))
            } else {
              langObj[result[0]][result[1]] = require(absolute.replace("bin", ".")) }
          } catch(err) {
            if (err) logger("warn", "vars.js", `langFiles function: lang ${result[0]} has an invalid file: ${err}`) }
          
          return; }
  }) }

var langObj = {}
logger("info", "vars.js", "Loading language files...", true, true)
langFiles("./bin/lang/"); //RECURSION TIME!
logger("info", "vars.js", `Found ${Object.keys(langObj).length} language(s)!`, true, true)

/**
* Returns the language obj the specified server has set
* @param {Number} guildid The id of the guild
* @returns Language file
*/
var lang = function lang(guildid) {
  if (!guildid) { logger('error', 'vars.js', "function lang: guildid not specified!"); return; }
  let serverlang = beepBot.settings[guildid].lang
  if (!Object.keys(langObj).includes(serverlang)) {
    logger("warn", "vars.js", `Guild ${guildid} has an invalid language! Returning english language...`)
    return langObj["english"]; }
  return langObj[serverlang] }

//Exporting var's:
module.exports={
    configpath,
    settingspath,
    Discord,
    si,
    superagent,
    exec,
    config,
    tokenpath,
    asciipath,
    fs,
    path,
    d,
    bootstart,
    beepBot,
    servers,
    commandcount,
    DEFAULTPREFIX,
    DEFAULTTESTPREFIX,
    BOTOWNER,
    OWNERID,
    botinvitelink,
    testbotinvitelink,
    botdefaultavatar,
    botxmasavatar,
    testbotdefaultavatar,
    githublink,
    BOTNAME,
    BOTAVATAR,
    randomstring,
    owneronlyerror,
    usermissperm,
    round,
    getuserfrommsg,
    randomhex,
    logger,
    langObj,
    lang,
    checkm8,
    servertosettings,
    cmdusetofile
}