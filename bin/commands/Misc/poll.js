const Discord = require('discord.js'); //eslint-disable-line

/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    var lf = lang.cmd.othermisc
    if (!args[0]) return message.channel.send(lang.cmd.othermisc.pollmissingargs)

    //Check for react perms
    if (!message.channel.permissionsFor(bot.user).has("ADD_REACTIONS")) return message.channel.send(lf.pollnoreactperms)

    var polltimelimit = "❌"
    var timelimit = -1 //for db that either stays false or gets replaced with timeinms by gettimefrommsg()
    var pollReactionAddtimelimit = 31557600000 //12 months
    var pollanonymous = "❌"

    //Construct question (there are probably other way better ways to do this but this will work just fine)
    var pollquestion = args[0]
    var notquestionargs = ["-time", "-t", "-anonym", "-a", undefined]

    for (var i = 1; i < args.length; i++) { //ignore first argument as this is already part of the string
        if (notquestionargs.includes(args[i])) break; //Break loop if we reached end of the question

        pollquestion += ` ${args[i]}`
    }

    //Check if poll should have a time limit
    if (message.content.includes("-time") || message.content.includes("-t")) {
        fn.gettimefrommsg(args, (timeinms, unitindex, arrcb) => { //the 3 arguments inside brackets are arguments from the callback
            if (!timeinms) return message.channel.send(lang.general.unsupportedtime.replace("timeargument", arrcb[1]))

            polltimelimit = `${arrcb[0]} ${lang.general.gettimefuncoptions[unitindex]}` //change permanent to timetext
            pollReactionAddtimelimit = timeinms
            timelimit = timeinms
        })
    }

    //Check if poll should be anonymous
    if (message.content.includes("-anonym") || message.content.includes("-a")) {
        pollanonymous = "✅"
    }

    var embedobj = {
        title: lf.pollnewpoll.replace("author", message.author.username),
        description: pollquestion,
        fields: [{
            name: "** **",
            value: `${lf.polltimelimit}: ${polltimelimit}
                    ${lf.pollanonymous}: ${pollanonymous}` },
        {
            name: lf.pollresults,
            value: `👍 - 0
                    👎 - 0
                    🤷 - 0`
        }],
        footer: { text: lf.pollfooter }
    }

    if (timelimit > 0) {
        embedobj.fields[1].value = lf.pollresultsreveal.replace("timetext", polltimelimit)
    }

    message.channel.send({ embed: embedobj }).then(async msg => {
        msg.react("👍")
        await msg.react("👎")
        await msg.react("🤷")

        //Add all 3 emotes to db (yes they need to have seperate entries which sucks a bit in this case but :shrug:)
        bot.monitorreactions.insert({ type: "pollcmd", msg: msg.id, reaction: "👍", count: 0, channelid: msg.channel.id, timelimit: timelimit, anonymous: message.content.includes("-anonym") || message.content.includes("-a"), until: Date.now() + pollReactionAddtimelimit }, (err) => {
            if (err) logger("error", "poll.js", "Error inserting poll 👍 to db: " + err) }) 
        bot.monitorreactions.insert({ type: "pollcmd", msg: msg.id, reaction: "👎", count: 0, channelid: msg.channel.id, timelimit: timelimit, anonymous: message.content.includes("-anonym") || message.content.includes("-a"), until: Date.now() + pollReactionAddtimelimit }, (err) => {
            if (err) logger("error", "poll.js", "Error inserting poll 👎 to db: " + err) }) 
        bot.monitorreactions.insert({ type: "pollcmd", msg: msg.id, reaction: "🤷", count: 0, channelid: msg.channel.id, timelimit: timelimit, anonymous: message.content.includes("-anonym") || message.content.includes("-a"), until: Date.now() + pollReactionAddtimelimit }, (err) => {
            if (err) logger("error", "poll.js", "Error inserting poll 🤷 to db: " + err) }) 
    })
}

module.exports.info = {
    names: ["poll", "vote", "survey"],
    description: "cmd.othermisc.pollinfodescription",
    usage: '(question) [-time/-t Number "seconds"/"minutes"/"hours"/"days"/"months"/"years"] [-anonym/-a]',
    accessableby: ['all'],
    allowedindm: false,
    nsfwonly: false
}