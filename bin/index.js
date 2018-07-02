console.log(" ")
const v = require("./vars.js")
var bootstart = v.d()
console.log("Loading...")

//Functions:
function avatarinterval() {
    if (v.d().getMonth() == 11) {
        v.bot.user.setUsername(v.BOTXMASNAME).catch(err => {
            console.log(v.LOGWARN + "Username fail. " + err + "\n ") })
        v.bot.user.setAvatar(v.botxmasavatar).catch(err => {
            console.log(v.LOGWARN + "Avatar fail. " + err + "\n ") })
    }else{
        v.bot.user.setUsername(BOTNAME).catch(err => {
            console.log(v.LOGWARN + "Username fail. " + err + "\n ") })
            
        v.bot.user.setAvatar(botavatar).catch(err => {
            console.log(v.LOGWARN + "Avatar fail. " + err + "\n ") })
    }
}

function botstartupmode() {
    try {
        if (v.botloginmode === "normal") {
            var TOKEN = v.tokenpath.token;
            v.bot.login(TOKEN)
        } else if (v.botloginmode === "test") {
            var TOKEN = v.tokenpath.testtoken;
            v.bot.login(TOKEN)
        } else {
            console.log(v.LOGWARN + "index function botstartupmode error logging in: ")
            return;
        }
    } catch(err) {
        console.log(v.LOGWARN + "index function botstartupmode error logging in: " + err)
    }
}

function updateserverlist() {
    v.fs.writeFile("./bin/serverlist.txt", "", err => {
        if (err) console.log("index function updateserverlist error clearing serverlist.txt: " + err)
    })
    for (guilds of v.bot.guilds){
        v.fs.appendFile("./bin/serverlist.txt", "  " + guilds[1].name + "\n", err => {
            if (err) console.log("index function updateserverlist error writing serverlist.txt: " + err)
        });
    }
}

async function voiceunmute(voiceunmuteMember) {
    voiceunmuteMember.setMute(false).then(member => {
        }).catch(err => {
            console.log("index function voiceunmute error: " + err)
        })
}

async function chatunmute(chatunmuteMember, chatmutedRole) {
    if (!chatmutedRole) {
        console.log("The 'beepBot Muted' role does not exist on this server.")
        return;
    }
    await chatunmuteMember.removeRole(chatmutedRole.id).catch(err => {
        console.log("index function chatunmute Error: " + err)
    })
}

async function unban(banguild, unbanMember) {
    banguild.unban(unbanMember).catch(err => {
        console.log("index function unban Error: " + err)
    })
}

if (v.botloginmode === "test") { 
    var PREFIX = "**";
    var BOTNAME = "beepTestBot";
    if (v.botconfig.game === v.DEFAULTGAME) {
        var GAME = "testing beepBot...";
    } else {
        var GAME = v.botconfig.game
    }
    var botavatar = v.testbotdefaultavatar;
    var botinvite = v.testbotinvitelink;
} else {
    var PREFIX = v.botconfig.prefix;
    var BOTNAME = "beepBot";
    var GAME = v.botconfig.game;
    var botavatar = v.botdefaultavatar;
    var botinvite = v.botinvitelink;
}

//BOT Startup
v.bot.on("ready", async function() {

    console.log(" ")
    console.log("*---------------------*")
    if (v.botloginmode === "normal") { console.log("Started " + BOTNAME + " " + v.BOTVERSION + " by " + v.BOTOWNER + " in " + v.botloginmode + " mode.") } 
    if (v.botloginmode === "test") { console.log("Started " + BOTNAME + " " + v.BOTVERSION + " by " + v.BOTOWNER + " in *" + v.botloginmode + "ing mode.*") }
    v.bot.user.setPresence({game: { name: GAME, type: v.botconfig.gametype, url: v.streamlink}, status: v.STATUS }).catch(err => {
        console.log("Game/Status error: " + err)
    }) 
    if (v.os.platform == "linux") console.log("I'm running on Linux...") 
    if (v.os.platform == "win32") console.log("I'm running on Windows...")

    console.log("Time: " + v.d())

    //Checks if it is christmas and changes avatar & username at startup and then every 1 hour.
    avatarinterval();

    v.bot.setInterval(() => {
        avatarinterval();
        console.log(v.LOGINFO + "6 hours passed, updated name and avatar. [" + v.d() + "]")
    }, 21600000); //1 hour in seconds to 6 hours in milliseconds.

    //Set 8ball askedbefore check to something at startup
    askedbefore = "undefined"

    //Command reader
    v.fs.readdir('./bin/commands/', (err, files) => {
        if (err) console.error(err);
        
        var jsfiles = files.filter(f => f.split('.').pop() === 'js');
        if (jsfiles.length <= 0) { return console.log("No commands found...")}
        else { console.log("-> " + jsfiles.length + " commands found.") }
        
        jsfiles.forEach((f, i) => {
            var cmds = require(`./commands/${f}`);
            v.bot.commands.set(cmds.config.command, cmds);
            v.bot.alias.set(cmds.config.alias, cmds)
            v.bot.alias2.set(cmds.config.alias2, cmds)
        })
        
        console.log("Set presence to: " + v.botconfig.status + " - " + v.botconfig.gametype.toLowerCase() + " " + GAME)

        var bootend = v.d() - bootstart
        console.info("The Bot is ready after %dms!", bootend);
        console.log("*---------------------*")
        console.log(" ")



        //Mute and Ban checker:
        v.bot.setInterval(() => {
            for(let i in v.bot.chatmutes) {
                let chattime = v.bot.chatmutes[i].time;
                let chatguildId = v.bot.chatmutes[i].guild;
                let chatmuteauthorId = v.bot.chatmutes[i].muteauthor;
                let chatmutechannelId = v.bot.chatmutes[i].mutechannel;
                let chatrawmuteduration = v.bot.chatmutes[i].rawmuteduration;
                let chatmutedurationtype = v.bot.chatmutes[i].mutedurationtype;

                let chatguild = v.bot.guilds.get(chatguildId)
                let chatunmuteMember = chatguild.members.get(i);
                let chatmutedRole = chatguild.roles.find(r => r.name === "beepBot Muted");
                let chatchannel = chatguild.channels.find("id", chatmutechannelId)
                let chatmuteauthor = chatguild.members.find("id", chatmuteauthorId)
                if (!chatmutedRole) continue;

                if (Date.now() > chattime) {
                    if ((Date.now() - chattime) > 10000 && chatunmuteMember === undefined) {
                        delete v.bot.chatmutes[i];
                        v.fs.writeFile(v.chatmutespath, JSON.stringify(v.bot.chatmutes), err => {
                            if (err) console.log("index timed chatmute erase from file undefined Error: " + err)
                        })
                        return;
                    }
                    chatunmute(chatunmuteMember, chatmutedRole)
                    chatchannel.send(chatunmuteMember + " was chat-unmuted after " + chatrawmuteduration + " " + chatmutedurationtype + " by " + chatmuteauthor + ".").catch(err => {
                        console.log("index timed chatmute send unmuted message Error: " + err)
                    })
                    
                    delete v.bot.chatmutes[i];
                    v.fs.writeFile(v.chatmutespath, JSON.stringify(v.bot.chatmutes), err => {
                        if (err) console.log("index timed chatmute erase from file Error: " + err)
                    })
                }
            }
        }, 5000)
        
        v.bot.setInterval(() => {
            for(let i in v.bot.voicemutes) {
                let voicetime = v.bot.voicemutes[i].time;
                let voiceguildId = v.bot.voicemutes[i].guild;
                let voicemuteauthorId = v.bot.voicemutes[i].muteauthor;
                let voicemutechannelId = v.bot.voicemutes[i].mutechannel;
                let voicerawmuteduration = v.bot.voicemutes[i].rawmuteduration;
                let voicemutedurationtype = v.bot.voicemutes[i].mutedurationtype;

                let voiceguild = v.bot.guilds.get(voiceguildId);
                let voiceunmuteMember = voiceguild.members.get(i);
                let voicechannel = voiceguild.channels.find("id", voicemutechannelId)
                let voicemuteauthor = voiceguild.members.find("id", voicemuteauthorId)

                if (Date.now() > voicetime) {
                    if (voiceunmuteMember === undefined) {
                        delete v.bot.voicemutes[i];
                        v.fs.writeFile(v.voicemutespath, JSON.stringify(v.bot.voicemutes), err => {
                            if (err) message.channel.send("index timed voicemute erase from file undefined Error: " + err)
                        })
                        return;
                    }
                    voiceunmute(voiceunmuteMember)
                    if (!voiceunmuteMember.voiceChannel) {
                        voicemuteauthor.send(voiceunmuteMember + " is now able to get voice-unmuted after " + voicerawmuteduration + " " + voicemutedurationtype + ". I can't unmute him if he is not in a voice channel so please do that yourself. Thanks! :)").catch(err => {
                            console.log("index timed voicemute send you can unmute message Error: " + err)
                        })
                    } else {
                        voicechannel.send(voiceunmuteMember + " was voice-unmuted after " + voicerawmuteduration + " " + voicemutedurationtype + " by " + voicemuteauthor + ".").catch(err => {
                            console.log("index timed voicemute send unmuted message Error: " + err)
                        })
                    }

                    delete v.bot.voicemutes[i];
                    v.fs.writeFile(v.voicemutespath, JSON.stringify(v.bot.voicemutes), err => {
                        if (err) message.channel.send("index timed voicemute erase from file Error: " + err)
                    })
                }
            }
        }, 5000)

        v.bot.setInterval(() => {
            for(let i in v.bot.bans) {
                let banname = v.bot.bans[i].name;
                let bantime = v.bot.bans[i].time;
                let banguildId = v.bot.bans[i].guild;
                let banauthorId = v.bot.bans[i].banauthor;
                let banchannelId = v.bot.bans[i].banchannel;
                let rawbanduration = v.bot.bans[i].rawbanduration;
                let bandurationtype = v.bot.bans[i].bandurationtype;
                let banreasontext = v.bot.bans[i].banreason;

                let banguild = v.bot.guilds.get(banguildId);
                let unbanMember = i;
                let banchannel = banguild.channels.find("id", banchannelId)
                let banauthor = banguild.members.find("id", banauthorId)

                if (Date.now() > bantime) {

                    unban(banguild, unbanMember)
                    banchannel.send(banauthor + ": The user @" + banname + " was unbanned after " + rawbanduration + " " + bandurationtype + ". __Ban-Reason:__ " + banreasontext).catch(err => {
                        console.log("index timed ban send unbanned message Error: " + err)
                    })

                    delete v.bot.bans[i];
                    v.fs.writeFile(v.banspath, JSON.stringify(v.bot.bans), err => {
                        if (err) message.channel.send("index timed ban erase from file Error: " + err)
                    })
                }
            }
        }, 5000)

        //serverlist.txt refresh once on startup than every hour:
        updateserverlist();
        v.bot.setTimeout(() => {
            updateserverlist()
        }, 3600 * 1000); //1 hour in milliseconds

        module.exports ={ 
            bootend,
            BOTNAME,
            PREFIX,
            botavatar,
            botinvite,
            GAME
        }
    });

    //Update server count for botsfordiscord.com widget
    v.BFD.postCount(v.bot.guilds.size, v.bot.user.id);
});

//Events
v.bot.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    if (guild.systemChannelID == null) {
        return;
    } else {
        guild.channels.find("id", guild.systemChannel.id).send("Hi im " + BOTNAME + " Version " + v.BOTVERSION + " by " + v.BOTOWNER + ". Get a list of my commands with `" + PREFIX + "help`. Type `" + PREFIX + "invite` to get an invite link.").catch(err => {
            console.log("index send guildCreate systemChannel message Error: " + err)
        })
    }
    guild.owner.send("Hi im " + BOTNAME + " Version " + v.BOTVERSION + " by " + v.BOTOWNER + ".\nThanks for adding me to your server! To get a overlook of all my commands just type `" + PREFIX + "help`.\nPlease make sure that the bot has all permissions and that the beepBot role is the highest one. Get more info with *privelegerror.\nThe greeting feature is enabled when a greeting channel is set in the server settings.\nIf you need help or something else join my server with `" + PREFIX + "invite!`\nHave fun!").catch(err => {
        console.log("index send guildCreate owner message Error: " + err)
    })
    //Update server count for botsfordiscord.com widget
    v.BFD.postCount(v.bot.guilds.size, v.bot.user.id)
});

v.bot.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    guild.owner.send("You removed me from your server :( ... \nIf you want me to come back just type `" + PREFIX + "invite` and i would be glad to be back!\nIf something didn't work out as you wanted let it me know on my server!\nhttps://discord.gg/q3KXW2P").catch(err => {
        console.log("index send guildDelete owner message Error: " + err)
    })
    //Update server count for botsfordiscord.com widget
    v.BFD.postCount(v.bot.guilds.size, v.bot.user.id)
});

v.bot.on("guildMemberAdd", async function(member) {
    // When a user joins the server message
    if (v.botloginmode === "test" && member.guild.id === "231828052127121408") return;
    if (member.guild.systemChannelID == null) {
        return;
    } else {
        member.guild.channels.find("id", member.guild.systemChannel.id).send("**" + member.user.username + "** joined! Welcome on **" + member.guild.name + "**! :) Get all of my commands with `" + PREFIX + "help`!").catch(err => {
        })
    }

    if (!member.guild.id === 231828052127121408) {
        return; }
    if (!member.guild.id === 232550371191554051) {
        return; }
    if (member.user.bot) {
        member.addRole(member.guild.roles.find("name", "Bot's")).catch(err => {
        })
    } else {
        member.addRole(member.guild.roles.find("name", "Member")).catch(err => {
        })
    }
});

v.bot.on("guildMemberRemove", function(member) {
    // When a user leaves the server direct message
    if (v.botloginmode === "test" && member.guild.id === "231828052127121408") return;
    var options = {
        maxAge: false
    }
    if (member.guild.systemChannelID != null) {
        member.guild.channels.find("id", member.guild.systemChannel.id).send("**" + member.user.username + "** left **" + member.guild.name + "**! :(").catch(err => {
        })
    }
    
/*     if (member.guild.systemChannelID == null) {

    } else {
        member.guild.channels.find("id", member.guild.systemChannel.id).send("**" + member.user.username + "** left **" + member.guild.name + "**! :(").catch(err => {
        })
        if (member.guild.size < 250) {
            member.guild.channels.find("id", member.guild.systemChannel.id).createInvite(options).then(function(newInvite) {
                member.send("Sadly you left **" + member.guild.name + "**. To join again use this link: https://discord.gg/" + newInvite.code)
            }).catch(err => {
            })
        }
    } */
});

/* v.bot.on("guildUnavailable", function(guild) {
    // When a guild becomes unavailable, likely due to a server outage if the guild has less then 500 members.
    if (member.guild.members.size < 500) {
        guild.owner.send("Your server **" + guild.name + "** has become unavailable just in this moment. This can be caused by a server outage. For more information check the Discord Server Status: https://status.discordapp.com/")
    }
}); */

v.bot.on("error", (e) => console.error("index error event: " + e));
v.bot.on("warn", (e) => console.warn("index warn event: " + e));
if (v.botconfig.debug === "true") {
    v.bot.on("debug", (e) => console.info(e));
}

//Command/Message Handler
v.bot.on("message", async function(message) {
    if (message.author.bot) return;

    if (message.channel.type != "dm") {
        if (message.mentions.members.size > 0) {
            if (message.mentions.members.get(v.bot.user.id) != undefined) {
                message.react(v.bot.guilds.get("231828052127121408").emojis.find("name","notification")).catch(err => {
                    console.log("index mention reaction Error: " + err)
                })
            }}}

    if (message.channel.type != "dm") {
        if (message.guild.id === "231828052127121408") {
            if (message.content.includes != null) {
                if (message.content.toLowerCase().includes("oof")) {
                    message.react(v.bot.guilds.get("231828052127121408").emojis.find("name","oof")).catch(err => {
                        console.log("index oof reaction Error: " + err)
                    })
                }}}}

    if (!message.content.startsWith(PREFIX)) return;

    //Add check if bot has permissions to send a message.
    
    var cont = message.content.slice(PREFIX.length).split(" ");
    var args = cont.slice(1);
    
    var cmd = v.bot.commands.get(cont[0].toLowerCase())
    var alias = v.bot.alias.get(cont[0].toLowerCase())
    var alias2 = v.bot.alias2.get(cont[0].toLowerCase())

    if (cmd) { 
        cmd.run(v.bot, message, args); 
        return;
         
    } else if (alias) {
        alias.run(v.bot, message, args);
        return;

    } else if (alias2) {
        alias2.run(v.bot, message, args);
        return;

    } else {
        if(message.content.includes(PREFIX + "*")) return;            
        if(message.content.endsWith(PREFIX)) return;
        //Disabled the error message because it was disturbing the chat.
        if (message.channel.type === "dm") {
            message.channel.send(v.wrongcmd())
        }
        return;
    }

    //The command reader in the 'ready' event imports the commands.
});

botstartupmode();