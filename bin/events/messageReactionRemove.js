//This file contains code of the messageReactionRemove event and is called by bot.js
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
            .catch((err) => { return logger("error", "messageReactionRemove.js", `Couldn't fetch reaction message ${reaction.message.id}! Error: ${err}`) }) }

    if (reaction.me) return; //ignore reactions by the bot itself

    bot.monitorreactions.findOne({ $and: [{msg: reaction.message.id}, {reaction: reaction._emoji.name}] }, (err, doc) => { //id and reaction itself must match
        if (!doc) return;
        if (err) return logger("error", "messageReactionRemove.js", "Error searching in db: " + err)
        
        switch (doc.type) {
            case "pollcmd":               
                reaction.message.fetch().then(res => { //always fetch message to ensure content is cached (fetch won't fetch the message again if it is already cached - I tested that)
                    if (doc.timelimit < 0) {
                        res.embeds[0].fields[1].value =`👍 - ${res.reactions.cache.get("👍").count - 1}
                                                        👎 - ${res.reactions.cache.get("👎").count - 1}
                                                        🤷 - ${res.reactions.cache.get("🤷").count - 1}`

                        reaction.message.edit({ embed: res.embeds[0] })
                    } else {
                        if (doc.anonymous) { //If vote is anonymous then update the reaction count in the db
                            bot.monitorreactions.update({$and: [{type: "pollcmd"}, {msg: res.id}, {reaction: reaction._emoji.name}] }, { $set: { count: res.reactions.cache.get(reaction._emoji.name).count - 1 }}, {}, (err) => { 
                                if (err) logger("error", "messageReactionRemove.js", "Error updating reaction count in db: " + err) 
                            })
                        }
                    }
                })
                break;
            default:
                return logger("error", "messageReactionRemove.js", "Invalid monitorreactions type in db! Fix this please: " + doc.type);
        }
    })
}