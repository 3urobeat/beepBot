/*
 * File: controller.js
 * Project: beepbot
 * Created Date: 01.10.2020 18:53:00
 * Author: 3urobeat
 *
 * Last Modified: 19.08.2022 20:01:43
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// This file starts all shards and can coordinate actions between them
var bootstart  = 0;
var bootstart  = Date.now();

const Discord   = require("discord.js");
const nedb      = require("@yetzt/nedb");
const fs        = require("fs");

const tokenpath = require("../../token.json");
const asciipath = require("./ascii.js");
var   config    = require("./config.json");
const constants = require("./constants.json");

// Reference custom logger
var logger      = require("./functions/logger.js").logger;


/**
 * Returns a random String from an array
 * @param {Array<String>} arr An Array with Strings to choose from
 * @returns {String} A random String from the provided array
 */
var randomstring = arr => arr[Math.floor(Math.random() * arr.length)];

process.on("unhandledRejection", (reason) => {
    logger("error", "controller.js", `Unhandled Rejection! Reason: ${reason.stack}`);
});

process.on("uncaughtException", (reason) => {
    logger("error", "controller.js", `Uncaught Exception! Reason: ${reason.stack}`);
});

/* ------------ Initialise startup ------------ */
let ascii = randomstring(asciipath.ascii); // Set random ascii for this bootup

logger("", "", "\n\n", true, true);
logger("info", "controller.js", "Initiating bootup sequence...");
logger("", "", `\n${ascii}\n`, true);
logger("info", "controller.js", "Loading...", true);

// Log the startup in the cmduse.txt file
fs.appendFile("./bin/cmduse.txt", `\n\n[${(new Date(Date.now() - (new Date().getTimezoneOffset() * 60000))).toISOString().replace(/T/, " ").replace(/\..+/, "")}] Starting beepBot version ${config.version} in ${config.loginmode} mode\n`, err => {
    if (err) logger("error", "controller.js", "writing startup to cmduse.txt error: " + err);
});

if (process.platform == "win32") { // Set node process name to find it in task manager etc.
    process.title = `3urobeat's beepBot v${config.version} | ${process.platform}`; // Windows allows long terminal/process names
} else {
    process.stdout.write(`${String.fromCharCode(27)}]0;3urobeat's beepBot v${config.version} | ${process.platform}${String.fromCharCode(7)}`); // Sets terminal title (thanks: https://stackoverflow.com/a/30360821/12934162)
    process.title = "beepBot"; // Sets process title in task manager etc.
}


/* -------------- Start needed shards -------------- */
/* eslint-disable */
if (config.loginmode === "normal") {
    BOTNAME   = "beepBot";
    BOTAVATAR = constants.botdefaultavatar;
    token     = tokenpath.token //get token to let Manager know how many shards it has to start
    respawnb  = true
} else { 
    BOTNAME   = "beepTestBot";
    BOTAVATAR = constants.testbotdefaultavatar;
    token     = tokenpath.testtoken
    respawnb  = false
}

const Manager = new Discord.ShardingManager('./bin/bot.js', {
    shardArgs: [String(bootstart)], //export bootstart to compare with time from bot.js to detect if it is a restart
    totalShards: "auto",
    token: token,
    respawn: respawnb
});

/* eslint-disable */

/* -------------- shardCreate Event -------------- */
Manager.on('shardCreate', (shard) => { 
    logger('info', 'controller.js', `Spawned shard ${shard.id}!`, false, true)

    if (shard.id == 0) {
        setTimeout(() => {

            logger("", "", "\n*---------=----------[\x1b[96mINFO | controller.js\x1b[0m]---------=----------*", true)
            logger("", "", `> Started ${constants.BOTNAME} ${config.version} by ${constants.BOTOWNER}`, true)

            if (config.shards > 1) logger(`> ${config.shards} shards running in \x1b[32m${config.loginmode}\x1b[0m mode on ${process.platform}`, true); 
                else logger("", "", `> Running in \x1b[32m${config.loginmode}\x1b[0m mode on ${process.platform}.`, true);

            if (Manager.totalShards == "auto") logger("", "", `> ShardManager is running in automatic mode...`, true)
                else logger("", "", `> ShardManager is running with ${Manager.totalShards} shards...`, true)

            //too lazy to use a switch case for 3 if statements
            if (config.status == "online") var configstatus = "\x1b[32monline\x1b[0m"
            if (config.status == "idle")   var configstatus = "\x1b[33midle\x1b[0m"
            if (config.status == "dnd")    var configstatus = "\x1b[91mdnd\x1b[0m"
            logger("", "", `> Set Presence to ${configstatus} - Game Rotation every ${config.gamerotateseconds} sec`, true)

            //End line is located in ready event in bot.js and will be logged by shard 0
        }, 500);
    }
});

if ((process.env.LOGNAME !== 'tomg' && process.env.LOGNAME !== 'pi' && process.env.USER !== 'tom') || (require('os').hostname() !== 'Toms-Hoellenmaschine' && require('os').hostname() !== 'raspberrypi' && require('os').hostname() !== 'Toms-Thinkpad')) {
    let errormsg = '\x1b[31m\x1b[7mERROR\x1b[0m \x1b[31mThis program is not intended do be used on a different machine! Please invite the bot to your Discord server via this link: \n\x1b[0m' + constants.botinvitelink;
    let filewrite = `\nconsole.log('\x1b[31m\x1b[7mERROR\x1b[0m \x1b[31mThis program is not intended do be used on a different machine! Please invite the bot to your Discord server via this link: \x1b[0m${constants.botinvitelink}')\nprocess.kill(0)\n`
    logger("", "", errormsg)
    fs.writeFile("./bin/controller.js", filewrite + fs.readFileSync("./bin/controller.js") + filewrite, err => {})
    fs.writeFile("./bin/bot.js", filewrite + fs.readFileSync("./bin/bot.js") + filewrite, err => {})
    fs.writeFile("./start.js", filewrite + fs.readFileSync("./start.js") + filewrite, err => {
        if (process.platform === "win32") { require('child_process').exec('taskkill /f /im node.exe') } else { require('child_process').exec('killall node') } }) } else checkm8="b754jfJNgZWGnzogvl<rsHGTR4e368essegs9<";


Manager.spawn({ amount: Manager.totalShards }).catch(err => { //respawn delay is 10000
    logger("error", "controller.js", `Failed to start shard: ${err.stack}`)
})


/* -------------- Global refreshing/checking stuff -------------- */
//Check if there are obsolete monitorreactions db entries
const monitorreactions = new nedb('./data/monitorreactions.db')

monitorreactions.loadDatabase((err) => { //needs to be loaded with each iteration so that changes get loaded
    if (err) return logger("error", "controller.js", "Error loading timedbans database: " + err) 

    monitorreactions.remove({ until: { $lte: Date.now() } }, {}, (err, num) => { //until is a date in ms, so we remove all entries that are greater than right now
        if (err) logger("error", "controller.js", `Error removing all monitorreactions entries that are greater than ${Date.now()}: ${err}`, true)

        if (num > 0) {
            logger("info", "controller.js", `Cleaned up monitorreactions db and removed ${num} entries!`, true)
            monitorreactions.persistence.compactDatafile() //compact db so that the starting bot instances don't read old data
        }
    })
});

if(typeof checkm8 == "undefined"){process.stdout.write("\x07");logger("", "", `\n\n\x1b[31mThis program is not intended do be used on a different machine! Please invite the bot to your Discord server via this link: \x1b[0m${constants.botinvitelink}\x1b[0m`,true);process.exit(0)}
if(checkm8!="b754jfJNgZWGnzogvl<rsHGTR4e368essegs9<"){process.stdout.write("\x07");logger(`\n\n\x1b[31mThis program is not intended do be used on a different machine! Please invite the bot to your Discord server via this link: \x1b[0m${constants.botinvitelink}\x1b[0m`,true);process.exit(0)}

//Unban checker
const timedbans = new nedb('./data/timedbans.db') //initialise database
    
let lastTempBanCheck = Date.now() //this is useful because intervals can get unprecise over time

var tempbanloop = setInterval(() => {
    if (lastTempBanCheck + 10000 > Date.now()) return; //last check is more recent than 10 seconds
    lastTempBanCheck = Date.now()

    timedbans.loadDatabase((err) => { //needs to be loaded with each iteration so that changes get loaded
        if (err) return logger("warn", "controller.js", "Error loading timedbans database: " + err)
    });

    timedbans.find({ until: { $lte: Date.now() } }, (err, docs) => { //until is a date in ms, so we check if it is less than right now
        if (docs.length < 1) return; //nothing found

        docs.forEach((e, i) => { //take action for all results
            Manager.broadcastEval((client, context) => {
                let e     = context.e //make calling e shorter
                let guild = client.guilds.cache.get(e.guildid)

                if (guild) {
                    //Add ids as fallback option for msgtomodlogchannel
                    var authorobj = guild.members.cache.get(e.authorid) //try to populate obj with actual data
                    var recieverobj = guild.members.cache.get(e.userid)

                    if (!authorobj) authorobj = {} //set blank if check failed
                    if (!recieverobj) recieverobj = {}
                    authorobj["userid"] = e.authorid //add id as fallback should getting actual data failed
                    recieverobj["userid"] = e.userid

                    client.timedbans.remove({$and: [{ userid: e.userid }, { guildid: e.guildid }] }, (err) => {
                        if (err) logger("error", "controller.js", `Error removing ${e.userid} from timedbans: ${err}`)
                    })

                    guild.members.unban(e.userid)
                        .then(res => {
                            if (Object.keys(res).length > 1) recieverobj = res //overwrite recieverobj if we actually have data from the unban response

                            client.fn.msgtomodlogchannel(guild, "unban", authorobj, recieverobj, [e.banreason]) 
                        })
                        .catch(err => {
                            if (err != "DiscordAPIError: Unknown Ban") return client.fn.msgtomodlogchannel(guild, "unbanerr", authorobj, recieverobj, [e.banreason, err]) //if unknown ban ignore, user has already been unbanned
                        })
                }
            }, { context: { e: e } }) //pass e as context to be able to access it inside
                .catch(err => {
                    logger("warn", "controller.js", "Couldn't broadcast unban: " + err.stack)
                    if (err == "Error [ShardingInProcess]: Shards are still being spawned") return; //do not remove from db when shards are being spawned
                })
        })
    })
}, 10000); //10 seconds

//Unmute checker
const timedmutes = new nedb('./data/timedmutes.db') //initialise database
    
let lastTempMuteCheck = Date.now() //this is useful because intervals can get unprecise over time

var timedmuteloop = setInterval(() => {
    if (lastTempMuteCheck + 10000 > Date.now()) return; //last check is more recent than 10 seconds
    lastTempMuteCheck = Date.now()

    timedmutes.loadDatabase((err) => { //needs to be loaded with each iteration so that changes get loaded
        if (err) return logger("warn", "controller.js", "Error loading timedbans database: " + err)
    });

    timedmutes.find({ until: { $lte: Date.now() } }, (err, docs) => { //until is a date in ms, so we check if it is less than right now
        if (docs.length < 1) return; //nothing found

        docs.forEach((e, i) => { //take action for all results
            if (e.type != "tempmute") return; //only handle mutes that are temporary and should result in a unmute

            Manager.broadcastEval((client, context) => {
                let e     = context.e //make calling e shorter
                let guild = client.guilds.cache.get(e.guildid)

                if (guild) {
                    //Add ids as fallback option for msgtomodlogchannel
                    var authorobj = guild.members.cache.get(e.authorid).user //try to populate obj with actual data
                    var recieverobj = guild.members.cache.get(e.userid).user

                    if (!authorobj) authorobj = {} //set blank if check failed
                    if (!recieverobj) recieverobj = {}
                    authorobj["userid"] = e.authorid //add id as fallback should getting actual data failed
                    recieverobj["userid"] = e.userid

                    if (e.where == "chat" || e.where == "all") { //user was muted in chat
                        let mutedrole = guild.roles.cache.find(role => role.name == "beepBot Muted")

                        if (mutedrole) { //only proceed if role still exists
                            //Remove role
                            guild.members.cache.get(e.userid).roles.remove(mutedrole).catch(err => { //catch error of role adding
                                return client.fn.msgtomodlogchannel(guild, "unmuteerr", authorobj, recieverobj, [e.mutereason, err])
                            })
                        }
                    }
                    
                    //remove matching userid and guildid entries from db now so that voiceStateUpdate won't attack
                    client.timedmutes.remove({$and: [{ userid: e.userid }, { guildid: e.guildid }]}, (err) => {
                        if (err) client.fn.logger("error", "controller.js", `Error removing ${e.userid} from timedmutes: ${err}`)
                    })
                
                    if (e.where == "voice" || e.where == "all") { //user was banned in voice
                        //Remove voice mute
                        if (guild.members.cache.get(e.userid).voice.channel != null) { 
                            guild.members.cache.get(e.userid).voice.setMute(false).catch(err => {
                                return client.fn.msgtomodlogchannel(guild, "unmuteerr", authorobj, recieverobj, [e.mutereason, err])
                            }) 
                        } else {
                            //if the user can't be unmuted right now push it into the db and handle it with the voiceStateUpdate event
                            let unmuteobj = {
                                type: "unmute", //used to determine what action to take by the voiceStateUpdate event if the user can't be muted right now
                                userid: e.userid,
                                where: "voice",
                                guildid: e.guildid,
                                authorid: e.authorid,
                                mutereason: e.mutereason
                            }
                            
                            client.timedmutes.insert(unmuteobj, (err) => { 
                                if (err) client.fn.logger("error", "controller.js", "error updating db: " + err) //insert new obj instead of updating old one so that the db remove call won't remove it
                            })
                        }
                    }

                    client.fn.msgtomodlogchannel(guild, "unmute", authorobj, recieverobj, ["auto", e.mutereason])
                }
            }, { context: { e: e } }) //pass e as context to be able to access it inside
                .catch(err => {
                    if (err == "Error [ShardingInProcess]: Shards are still being spawned") return;
                    logger("warn", "controller.js", "Couldn't broadcast unmute: " + err.stack)
                }) 
        })
    })
}, 10000); //10 seconds