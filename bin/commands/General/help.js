module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => {
    if (!args[0]) { args[0] = "" }
    args[0].replace(v.beepBot.settings[message.guild.id].prefix, "") //remove prefix from argument if the user should have provided one

    let lf = lang.cmd.help //lc for lang-file

    if (args[0]) { //user wants detailed information to one command?
        let cmd = v.beepBot.commands.get(args[0].toLowerCase())
        
        if (cmd) {
            if (cmd.info.names.length > 1) var cmdaliases = cmd.info.names.filter((_, i) => i !== 0); //Remove first entry - Credit: https://stackoverflow.com/a/27396779/12934162
                else var cmdaliases = [lf.noaliases] //return as array so that .join doesn't throw error
            
            function replaceBool(value) { return String(value).replace("true", "✅").replace("false", "❌") }

            message.channel.send({ 
                embed: {
                    title: `${lf.help} - ${cmd.info.names[0]}`,
                    color: v.randomhex(),
                    description: `${cmd.info.description}`,
                    fields: [{
                        name: `${lf.aliases}:`,
                        value: cmdaliases.join(", "),
                        inline: true
                    },
                    {
                        name: `${lf.category}:`,
                        value: cmd.info.category,
                        inline: true
                    },
                    {
                        name: `${lf.usage}:`,
                        value: `\`${v.beepBot.settings[message.guild.id].prefix}${cmd.info.names[0]} ${cmd.info.usage}\`\n*[] <- ${lf.optionalargument}, () <- ${lf.requiredargument}*`
                    },
                    {
                        name: `${lf.restrictions}:`,
                        value: `${lf.cmdaccessableby}: ${String(cmd.info.accessableby).replace("all", lf.cmdaccessablebyall)}
                                ${lf.cmdallowedindm}: ${replaceBool(cmd.info.allowedindm)}
                                ${lf.cmdnsfwonly}: ${replaceBool(cmd.info.nsfwonly)}`
                    }],
                    footer: { icon_url: message.author.displayAvatarURL(), text: `${lang.general.requestedby} ${message.author.username} • ${lf.setrestrictionsinsettings}: ${v.beepBot.settings[message.guild.id].prefix}settings` }
                }
            })
        } else {
            return message.channel.send(lf.cmdnotfound) }

    } else { //No argument given, construct full list of commands

        var msg = {}
        var commandsObj = v.beepBot.commands.array()
        var unsortedcategories = {}
        var sortedcategories = {}

        //Pre-configure message
        msg = { 
            embed: {
                title: `${lf.help} - ${lf.commandlist}`,
                color: v.randomhex(),
                thumbnail: { url: bot.user.avatarURL() },
                description: `__${lf.overviewofxcmds.replace("commandcount", `**${v.commandcount}**`)}__:\n${lf.detailedcommandinfo.replace("prefix", v.beepBot.settings[message.guild.id].prefix)}`,
                fields: [],
                footer: { icon_url: message.author.displayAvatarURL(), text: `${lang.general.requestedby} ${message.author.username}` },
                timestamp: v.d()
            }
        }

        //Get all unsortedcategories into array
        commandsObj.forEach(e => {
            //Create new Array for category if it doesn't exist yet
            if (!unsortedcategories[e.info.category]) unsortedcategories[e.info.category] = []

            //Check if this iteration is an alias cmd by checking this value that was added in the cmd reading process
            if (e.info.thisisanalias == true) return;
            
            //Add command to existing Category Array
            unsortedcategories[e.info.category].push(`\`${v.beepBot.settings[message.guild.id].prefix}${e.info.names[0]}\` - ${e.info.description}`)
        });

        //Sort Object by order defined in config
        v.config.helpcategoryorder.forEach((e, i) => {
            if (e == "other") { //Check if this key is the key for all categories with no specific order
                Object.keys(unsortedcategories).forEach((k) => { //Loop ober all categories
                    if (!v.config.helpcategoryorder.includes(k)) { //Check if this is one of the categories with no specific order
                        sortedcategories[k] = unsortedcategories[k] //Just add it
                    } })
            } else {
                sortedcategories[e] = unsortedcategories[e] } //Add Category to Object
        })

        //Add sortedcategories with commands to msg
        Object.keys(sortedcategories).forEach((e, i) => {
            msg.embed.fields.push({ 
                name: e,
                value: sortedcategories[e]
            })
        })

        //Finally send message
        message.channel.send(msg)
    }
}

module.exports.info = {
    names: ["help", "h", "commands"],
    description: "List of all commands or information of a specific command.",
    usage: "[command name]",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}