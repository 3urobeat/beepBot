const index = require("./index.js")

const configpath   = "./config.json"
const settingspath = "./bin/data/settings.json"

const englishlangpath = "./lang/english.json"
const germanlangpath  = "./lang/german.json"

const Discord    = require("discord.js")
const si         = require("systeminformation")
var exec         = require('child_process').exec, child
var botconfig    = require(configpath)
const tokenpath  = require("../../token.json")
const asciipath  = require("./ascii.js")
const fs         = require("fs")
const readline   = require("readline")
const d          = function d() { return new Date() }

const englishlang = require(englishlangpath) 
const germanlang  = require(germanlangpath)

const bot = new Discord.Client()
const servers = {}

bot.commands = new Discord.Collection()

setInterval(() => {
  delete require.cache[require.resolve("./data/settings.json")]
  bot.settings = require("./data/settings.json")
},1000)

const DEFAULTPREFIX     = "*" 
const DEFAULTTESTPREFIX = "**"
const DEFAULTGAME       = `${DEFAULTPREFIX}help | 3urobeat`
const BOTXMASNAME       = "beepBot🎅🎄";
const BOTOWNER          = "3urobeat#0975"
const OWNERID           = "231827708198256642"

const botinvitelink = "https://discordapp.com/oauth2/authorize?client_id=265162449441783808&scope=bot&permissions=1610087551";
const testbotinvitelink = "https://discordapp.com/oauth2/authorize?client_id=264403059575095307&scope=bot&permissions=1610087551";
const botdefaultavatar = "https://i.imgur.com/64BkKW4.png";
const botxmasavatar = "https://i.imgur.com/GgHBtkG.png";
const testbotdefaultavatar = "https://i.imgur.com/gmP9eFn.png";
const githublink = "https://github.com/HerrEurobeat";
const streamlink = "https://www.twitch.tv/discordapp"

var LOGINFO = () => { return `\x1b[34m[INFO | ${require("path").basename(__file)}]\x1b[0m ` }
var LOGWARN = () => { return `\x1b[31m[WARN | ${require("path").basename(__file)}]\x1b[0m ` }
var LOGERR  = () => { return `\x1b[31m[\x1b[7mERROR\x1b[0m\x1b[31m | ${require("path").basename(__file)}]\x1b[0m ` }

var randomstring = arr => arr[Math.floor(Math.random() * arr.length)]

var owneronlyerror = function owneronlyerror(guildid) { return randomstring(lang(guildid).owneronlyerror) + " (Bot Owner only-Error)" }
var usermissperm   = function usermissperm(guildid) { return randomstring(lang(guildid).usermissperm) + " (Role permission-Error)" }

const round = function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals)
}
const randomhex = function randomhex() {
  return Math.floor(Math.random() * 16777214) + 1
}

Object.defineProperty(global, '__stack', { //Straight from Stack Overflow (https://stackoverflow.com/a/14172822) copied code to get the filename of a variable caller
  get: function() {
          var orig = Error.prepareStackTrace;
          Error.prepareStackTrace = function(_, stack) {
              return stack; };
          var err = new Error;
          Error.captureStackTrace(err, arguments.callee);
          var stack = err.stack;
          Error.prepareStackTrace = orig;
          return stack; }});
Object.defineProperty(global, '__file', {
get: function() {
        return __stack[2].getFileName() }});

var logger = (str, nodate, remove) => { //Custom logger
  var str = String(str)
  if (str.toLowerCase().includes("error")) { var str = `\x1b[31m${str}\x1b[0m` }

  if (nodate) var string = str; 
    else var string = `\x1b[96m[${(new Date(Date.now() - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, ' ').replace(/\..+/, '')}]\x1b[0m ${str}`
            
  if (remove) {
      readline.clearLine(process.stdout, 0) //0 clears entire line
      process.stdout.write(`${string}\r`)
  } else { 
      readline.clearLine(process.stdout, 0)
      console.log(`${string}`) }

  fs.appendFileSync('./bin/output.txt', string.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '') + '\n', err => { //Regex Credit: https://github.com/Filirom1/stripcolorcodes
    if(err) logger(LOGERR + 'logger function appendFileSync error: ' + err) }) }

var lang = function lang(guildid) {
  if (!guildid) { logger(LOGERR + "function lang: guildid not specified!"); return; }
  if (bot.settings[guildid].lang === "english") return englishlang; 
  if (bot.settings[guildid].lang === "german") return germanlang; }

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

//Exporting var's:
module.exports={
    configpath,
    settingspath,
    Discord,
    si,
    exec,
    botconfig,
    tokenpath,
    asciipath,
    fs,
    d,
    englishlang,
    germanlang,
    bot,
    servers,
    DEFAULTPREFIX,
    DEFAULTTESTPREFIX,
    DEFAULTGAME,
    BOTXMASNAME,
    BOTOWNER,
    OWNERID,
    botinvitelink,
    testbotinvitelink,
    botdefaultavatar,
    botxmasavatar,
    testbotdefaultavatar,
    githublink,
    streamlink,
    LOGINFO,
    LOGWARN,
    LOGERR,
    randomstring,
    owneronlyerror,
    usermissperm,
    round,
    randomhex,
    logger,
    lang,
    checkm8
}