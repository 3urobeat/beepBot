//This file contains code of the voiceStateUpdate event and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

module.exports.run = (bot, oldstate, newstate) => {
    if (!oldstate || !newstate) return; //dunno why but I once got a 'Cannot read property 'id' of null' so maybe it can be undefined? dunno but it is weird

    bot.settings.findOne({ guildid: oldstate.guild.id }, (err, gs) => {
        if (err) gs = bot.langObj["english"]

        //Check if this update is caused by someone who needs their mute status changed
        bot.timedmutes.findOne({$and: [{ userid: newstate.member.id }, { guildid: newstate.guild.id }] }, (err, doc) => {
            if (!doc) return; //nothing found
            
            if (doc.where == "all" || doc.where == "voice") { //check if the mute type is voice
                if (doc.type == "tempmute" || doc.type == "permmute" && !newstate.member.voice.serverMute) { //check if user is not muted (serverMute returns true or false) but should be muted
                    //mute and attach reason for audit log
                    newstate.member.voice.setMute(true, bot.langObj[gs.lang].general.voicestateupdatemutereason.replace("muteauthor", newstate.guild.members.cache.get(doc.authorid).user.username).replace("reasontext", doc.mutereason)).catch(() => { })
                } 

                if (doc.type == "unmute") {
                    newstate.member.voice.setMute(false, bot.langObj[gs.lang].general.voicestateupdateunmutereason.replace("muteauthor", newstate.guild.members.cache.get(doc.authorid).user.username).replace("reasontext", doc.mutereason)).catch(() => { })
                    bot.timedmutes.remove({$and: [{ userid: newstate.member.id }, { guildid: newstate.guild.id }]})
                }
            } })
    }) 
}