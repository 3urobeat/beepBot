//This file contains code of the messageReactionAdd event and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

const Discord = require('discord.js'); //eslint-disable-line

/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = (bot, logger, reaction, user) => { //eslint-disable-line
    //Fetch a reaction if it is a partial to be able to work with messages that were sent before the bot was started
    if (reaction.partial) {
        //logger("info", "messageReactionAdd.js", `Fetching a partial reaction... ID: ${reaction.message.id}`, false, true)
        reaction.fetch()
            //.then(() => { logger("info", "messageReactionAdd.js", `Successfully fetched reaction message ${reaction.message.id}.`, false, true) })
            .catch((err) => { return logger("error", "messageReactionAdd.js", `Couldn't fetch reaction message ${reaction.message.id}! Error: ${err}`) }) }

    if (reaction.me) return; //ignore reactions by the bot itself

    bot.monitorreactions.findOne({ $and: [{msg: reaction.message.id}, {reaction: reaction._emoji.name}] }, (err, doc) => { //id and reaction itself must match
        if (!doc) return;
        if (err) return logger("error", "messageReactionAdd.js", "Error searching in db: " + err)
        
        switch (doc.type) {
            case "modlog": //for wastebasket reaction on modlog messages
                if (doc.allowedroles.filter(element => reaction.message.guild.members.cache.get(user.id).roles.cache.has(element)).length > 0 || user.id == reaction.message.guild.owner.id) { //either user has role or is owner of guild
                    reaction.message.delete()
                        .then(() => {
                            bot.monitorreactions.remove({ reaction: reaction._emoji.name }, {}, (err) => { 
                                if (err) logger("error", "messageReactionAdd.js", `Error removing ${reaction._emoji.name} of msg ${reaction.message.id} from db after deleting msg: ${err}`) })
                            return; })
                        .catch(err => { reaction.message.channel.send(`Error deleting message: ${err}`) }) 
                } else return;
                break;
            case "createGuildlang": //for language reactions on createGuild welcome message
                var requestedlang = {}
                var requestedlangname = ""

                Object.keys(bot.langObj).every((e) => {
                    if (bot.langObj[e]["general"]["langemote"] == reaction._emoji.name) { 
                        requestedlang = bot.langObj[e]
                        requestedlangname = e
                        return false; //stops loop
                    } else return true; }) //continues with next iteration

                //uhh this next line shouldn't trigger
                if (Object.keys(requestedlang).length == 0) return logger("warn", "messageReactionAdd.js", "I could't find a language to a createGuildlang reaction. :/ Emote: " + reaction._emoji.name)
                
                reaction.message.edit({embed: {
                    title: requestedlang.general.botaddtitle,
                    description: requestedlang.general.botadddesc + requestedlang.general.botadddesc2.replace(/prefix/g, bot.constants.DEFAULTPREFIX),
                    thumbnail: { url: bot.user.displayAvatarURL() },
                    footer: {
                        text: requestedlang.general.botaddfooter }
                } }).then(() => { reaction.users.remove(user).catch(() => {}) }) //catch but ignore error

                //if the user didn't change the lang using the settings cmd we are still allowed to do that automatically to bring in some "magic"! (I feel like Apple rn lol)
                if (doc.enablesettingslangchange) bot.settings.update({ guildid: doc.guildid }, { $set: { lang: requestedlangname }}, {}, () => { }) //catch but ignore error
                break;
            case "pollcmd":
                reaction.message.fetch().then(res => { //always fetch message to ensure content is cached (fetch won't fetch the message again if it is already cached - I tested that)
                    //Check if user has reacted to another poll emoji and if that is the case then remove and ignore this vote
                    if (reaction._emoji.name != "👍" && res.reactions.cache.get("👍").users.cache.has(user.id)) return reaction.users.remove(user).catch(() => {})
                    if (reaction._emoji.name != "👎" && res.reactions.cache.get("👎").users.cache.has(user.id)) return reaction.users.remove(user).catch(() => {})
                    if (reaction._emoji.name != "🤷" && res.reactions.cache.get("🤷").users.cache.has(user.id)) return reaction.users.remove(user).catch(() => {})
                    if (doc.anonymous) reaction.users.remove(user).catch(() => {})

                    //Update results if the vote has no time limit
                    if (doc.timelimit < 0) {
                        res.embeds[0].fields[1].value =`👍 - ${res.reactions.cache.get("👍").count - 1}
                                                        👎 - ${res.reactions.cache.get("👎").count - 1}
                                                        🤷 - ${res.reactions.cache.get("🤷").count - 1}`

                        reaction.message.edit({ embed: res.embeds[0] })
                    } else {
                        if (doc.anonymous) { //If vote is anonymous then update the reaction count in the db
                            bot.monitorreactions.update({$and: [{type: "pollcmd"}, {msg: res.id}, {reaction: reaction._emoji.name}] }, { $set: { count: res.reactions.cache.get(reaction._emoji.name).count - 1 }}, {}, (err) => { 
                                if (err) logger("error", "messageReactionAdd.js", "Error updating reaction count in db: " + err) 
                            })
                        }
                    }

                    
                })
                break;
            default:
                return logger("error", "messageReactionAdd.js", "Invalid monitorreactions type in db! Fix this please: " + doc.type);
        }
    })
}