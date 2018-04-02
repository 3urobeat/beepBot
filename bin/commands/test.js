module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
/*     const talkedRecently = new Set();

    if (talkedRecently.has(message.author.id)) {
        message.channel.send("Wait 1 minute before getting typing this again. - " + message.author);
    } else {

        message.channel.send("Test.")

        // Adds the user to the set so that they can't talk for a minute
        talkedRecently.add(message.author.id);
        v.bot.setTimeout(() => {
          // Removes the user from the set after a minute
          talkedRecently.delete(message.author.id);
        }, 60000);
    } */

    }

module.exports.config = {
    command: "test"
}