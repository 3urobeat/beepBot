const index = require("./index.js")

//Variables and definitions:
const configpath = "./config.json";
const aliaspath = "./bin/help/aliases.txt"
const helppath = "./bin/help/help.txt";
const helppath2 = "./bin/help/help2.txt";
const helppath3 = "./bin/help/help3.txt";
const chatmutespath = "./eventdata/chatmutes.json"
const voicemutespath = "./eventdata/voicemutes.json"
const banspath = "./eventdata/bans.json"

const Discord = require("discord.js");
const os = require("os");
const YTDL = require("ytdl-core");
const superagent = require("superagent");
var exec = require('child_process').exec, child;
var botconfig = require(configpath);
var tokenpath = require("../../token.json")
const fs = require("fs");
const d = new Date();

const bot = new Discord.Client();
const servers = {};

//Commands and aliases
bot.commands = new Discord.Collection();
bot.alias = new Discord.Collection();
bot.alias2 = new Discord.Collection();
bot.chatmutes = require("../eventdata/chatmutes.json")
bot.voicemutes = require("../eventdata/voicemutes.json")
bot.bans = require("../eventdata/bans.json")

var randomstring = arr => arr[Math.floor(Math.random() * arr.length)];

const botinvitelink = "https://discordapp.com/oauth2/authorize?client_id=265162449441783808&scope=bot&permissions=1610087551";
const testbotinvitelink = "https://discordapp.com/oauth2/authorize?client_id=264403059575095307&scope=bot&permissions=1610087551";
const botdefaultavatar = "https://i.imgur.com/64BkKW4.png";
const botxmasavatar = "https://i.imgur.com/GgHBtkG.png";
const testbotdefaultavatar = "https://i.imgur.com/gmP9eFn.png"
const githublink = "https://github.com/HerrEurobeat/beepBot"

var botloginmode = botconfig.loginmode;

const DEFAULTGAME = "*help | HerrEurobeat";
var BOTXMASNAME = "beepBot🎅🎄";
var BOTVERSION = botconfig.version;
var STATUS = "dnd";
const BOTOWNER = "HerrEurobeat#0940";
const OWNERID = "231827708198256642";
const BOTID = "265162449441783808";

const LOGINFO = "[INFO] ";
const LOGWARN = "[WARN] ";

var owneronlyerror = function owneronlyerror() { return randomstring(["This command is owner only. What did you think?!","You are not the owner. Check your id with *userid","I'm not dumb.","I'm secure. Secure as hell.","Security does not let you in.","Gotcha! You are not going to harm anyone!"]) + " (Owner-Error)" }
var usermissperm = function usermissperm() { return randomstring(["You do not have enough permission to do this.","Argh, you can't do this.","Sorry but no. The owner of this server does not want to let you do this.","You are not allowed to do this.","Blame the server owner!"]) + " (Perm-Error)" }
var dmerror = function dmerror() { return randomstring(["That cannot work in a dm. :face_palm::skin-tone-2:","That won't work in a DM...","This command in a DM? No.","Sorry but no. Try it on a server.","You need to be on a server!"]) + " (DM-Error)" }
var wrongcmd = function wrongcmd() { return randomstring(["Invalid command! :neutral_face:","You got something wrong there!","Something is wrong... :thinking:","Oh shit you have to correct something!","This error should not have happened.","I'm sorry but i catched an error that was thrown by you.","Whoops - I didn't wanted this to happen.","Trust me. Something is wrong with your command.","Windows would have been crashed now!","That is not right."]) + " (Cmd-Error)" }

const round = function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}
const randomhex = function randomhex() {
  return Math.floor(Math.random() * 16777214) + 1
}

//Exporting var's:
module.exports={
    configpath,
    aliaspath,
    helppath,
    helppath2,
    helppath3,
    chatmutespath,
    voicemutespath,
    banspath,
    Discord,
    os,
    YTDL,
    superagent,
    exec,
    botconfig,
    tokenpath,
    fs,
    d,
    bot,
    servers,
    botinvitelink,
    testbotinvitelink,
    DEFAULTGAME,
    BOTXMASNAME,
    BOTVERSION,
    STATUS,
    BOTOWNER,
    OWNERID,
    BOTID,
    LOGINFO,
    LOGWARN,
    botdefaultavatar,
    botxmasavatar,
    testbotdefaultavatar,
    githublink,
    botloginmode,
    randomstring,
    owneronlyerror,
    usermissperm,
    dmerror,
    wrongcmd,
    round,
    randomhex
  }