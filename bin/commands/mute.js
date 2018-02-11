module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const fs = v.fs
    
    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return;
    }
    let muteMember = message.guild.member(message.mentions.members.first());

    if (message.mentions.users.size === 0) { message.channel.send("Please mention a valid user!"); return; }
    if (muteMember.id == v.BOTID) { message.channel.send(v.randomstring(["I won't mute myself what are you thinking?! :angry:","I don't like you anymore.","No. :angry:","Dont fight me with my own weapons!","Is there a way to block you?","Could someone kick this guy?"])); return; }
    if (muteMember.id == message.author.id) { message.channel.send("You can't mute yourself. :facepalm:"); return; }
    if (muteMember.highestRole.position >= message.member.highestRole.position) { message.channel.send("You cannot mute a member who is higher or has the same role as you."); return; }

    if (message.member.permissions.has("MUTE_MEMBERS", "ADMINISTRATOR")) {

        var role = message.guild.roles.find(r => r.name === "beepBot Muted")
        if (!role) {
            try {
                role = await message.guild.createRole({
                    name: "beepBot Muted",
                    color: "#99AAB5",
                    permissions: []
                });

                message.guild.channels.forEach(async (channel, id) => {
                    await channel.overwritePermissions(role, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false
                    });
                });
            } catch(err) {
                message.channel.send("Error: " + err)
                return;
            }
        }

        //vars:
        let mutetype = args[0].toLowerCase()
        let muteauthor = message.author
        let rawmuteduration = args[2]
        let mutedurationtype = args[3].toLowerCase()

        if (rawmuteduration === undefined) {

            //permanent:
            if (mutetype === "chat") {
                if (muteMember.roles.has(message.guild.roles.find("name", "beepBot Muted").id)) {
                    message.channel.send(muteMember + " is already chat-muted.")
                    return; }

                chatmute();
                await message.channel.send(muteMember + " was permanent chat-muted.")
            } else if (mutetype === "voice") {
                if (!muteMember.voiceChannel) {
                    message.channel.send("I can't mute someone who is not in a voice channel...")
                    return; }
                if (muteMember.serverMute === true) {
                    message.channel.send(muteMember + " is already voice-muted.")
                    return; }

                voicemute();
                await message.channel.send(muteMember + " was permanent voice-muted.")
            } else if (mutetype === "all") {
                if (!muteMember.voiceChannel) {
                    message.channel.send("I can't mute someone who is not in a voice channel...")
                    return; }
                if (muteMember.roles.has(message.guild.roles.find("name", "beepBot Muted").id)) {
                    message.channel.send(muteMember + " is already chat-muted.")
                    return; }
                if (muteMember.serverMute === true) {
                    message.channel.send(muteMember + " is already voice-muted.")
                    return; }

                chatmute();
                voicemute();
                await message.channel.send(muteMember + " was chat and voice-muted.")
            } else {
                message.channel.send("Please define where the user should be muted `chat|voice|all`!")
                return;
            }

        } else {

            //timed mute checks:
            if (isNaN(rawmuteduration) === true) { message.channel.send("It's something but not a clear number."); return; }
            if (rawmuteduration === undefined) { message.channel.send("Mute duration is not defined."); return; }
            if (mutedurationtype === "seconds") {
                var muteduration = rawmuteduration * 1000
            } else if (mutedurationtype === "minutes") { 
                var muteduration = rawmuteduration * 60000; 
            } else if (mutedurationtype === "hours") { 
                var muteduration = rawmuteduration * 3600000;
            } else if (mutedurationtype === "days") {
                var muteduration = rawmuteduration * 86400000;
            } else { 
                message.channel.send("Please provide 'minutes' or 'hours'"); 
                    return; }      

            //timed:
            if (mutetype === "chat") {
                if (muteMember.roles.has(message.guild.roles.find("name", "beepBot Muted").id)) {
                    message.channel.send(muteMember + " is already chat-muted.")
                    return; }

                timedchatmute(rawmuteduration, mutedurationtype, muteauthor);
                await message.channel.send(muteMember + " was chat-muted for " + rawmuteduration + " " + mutedurationtype + " by " + muteauthor + ".")

            } else if (mutetype === "voice") {
                if (!muteMember.voiceChannel) {
                    message.channel.send("I can't mute someone who is not in a voice channel...")
                    return; }
                if (muteMember.serverMute === true) {
                    message.channel.send(muteMember + " is already voice-muted.")
                    return; }
                
                timedvoicemute(rawmuteduration, mutedurationtype, muteauthor);
                await message.channel.send(muteMember + " was voice-muted for " + rawmuteduration + " " + mutedurationtype + " by " + muteauthor + ".")

            } else if (mutetype === "all") {
                if (!muteMember.voiceChannel) {
                    message.channel.send("I can't mute someone who is not in a voice channel...")
                    return; }
                if (muteMember.roles.has(message.guild.roles.find("name", "beepBot Muted").id)) {
                    message.channel.send(muteMember + " is already chat-muted.")
                    return; }
                if (muteMember.serverMute === true) {
                    message.channel.send(muteMember + " is already voice-muted.")
                    return; }

                timedchatmute(rawmuteduration, mutedurationtype, muteauthor);
                timedvoicemute(rawmuteduration, mutedurationtype, muteauthor);
                await message.channel.send(muteMember + " was chat and voice-muted.")

            } else {
                message.channel.send("Please define where the user should be muted `chat|voice|all`!")
                return;
            }

        }

    } else {
        message.channel.send(v.usermissperm())
    }


    //Mute functions:
    async function timedchatmute(rawmuteduration, mutedurationtype, muteauthor) {
        bot.chatmutes[muteMember.id] = {
            guild: message.guild.id,
            time: Date.now() + muteduration,
            muteauthor: muteauthor.id,
            mutechannel: message.channel.id,
            rawmuteduration: rawmuteduration,
            mutedurationtype: mutedurationtype
        }   
        fs.writeFile(v.chatmutespath, JSON.stringify(bot.chatmutes, null, 4), err => {
            if(err) message.channel.send("Error: " + err); return;
        });
        await muteMember.addRole(role);
    }

    async function chatmute() {
        await muteMember.addRole(role);
    }

    async function timedvoicemute(rawmuteduration, mutedurationtype, muteauthor) {
        bot.voicemutes[muteMember.id] = {
            guild: message.guild.id,
            time: Date.now() + muteduration,
            muteauthor: muteauthor.id,
            mutechannel: message.channel.id,
            rawmuteduration: rawmuteduration,
            mutedurationtype: mutedurationtype
        }
        fs.writeFile(v.voicemutespath, JSON.stringify(bot.voicemutes, null, 4), err => {
            if(err) message.channel.send("Error: " + err); return;
        });
        await muteMember.setMute(true);
    }

    async function voicemute() {
        muteMember.setMute(true).then(member => {
            }).catch(err => {
                message.channel.send("An error occured: " + err)
            })
    }

}

module.exports.config = {
    command: "mute"
}