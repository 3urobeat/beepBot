module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    if (!args[0]) { args[0] = "" }
    args[0].replace(guildsettings.prefix, "") //remove prefix from argument if the user should have provided one

    let lf = lang.cmd.help //lf for lang-file
    function replaceBool(value) { return String(value).replace("true", "✅").replace("false", "❌") }

    if (args[0]) { //user wants detailed information to one command?
        let cmd = bot.commands.get(args[0].toLowerCase())
        
        if (cmd) {
            if (cmd.info.names.length > 1) var cmdaliases = cmd.info.names.filter((_, i) => i !== 0); //Remove first entry - Credit: https://stackoverflow.com/a/27396779/12934162
                else var cmdaliases = [lf.noaliases] //return as array so that .join doesn't throw error

            message.channel.send({ 
                embeds: [{
                    title: `${lf.help} - ${cmd.info.names[0]}`,
                    color: fn.randomhex(),
                    description: `${require("lodash").get(lang, cmd.info.description)}`, //lodash is able to replace the obj path in the str with the corresponding item in the real obj. Very cool!,
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
                        value: `\`${guildsettings.prefix}${cmd.info.names[0]} ${cmd.info.usage}\`\n\n*[] <- ${lf.optionalargument}, () <- ${lf.requiredargument}*`
                    },
                    {
                        name: `${lf.restrictions}:`,
                        value: `${lf.cmdaccessableby}: ${String(cmd.info.accessableby).replace("all", lf.cmdaccessablebyall)}
                                ${lf.cmdallowedindm}: ${replaceBool(cmd.info.allowedindm)}
                                ${lf.cmdnsfwonly}: ${replaceBool(cmd.info.nsfwonly)}`
                    }],
                    footer: { icon_url: message.author.displayAvatarURL(), text: `${lang.general.requestedby} ${message.author.username} • ${lf.setrestrictionsinsettings}: ${guildsettings.prefix}settings` }
                }]
            })
        } else {
            return message.channel.send(lf.cmdnotfound) }

    } else { //No argument given, construct full list of commands

        var msg = {}
        var commandsObj = [...bot.commands.values()]
        var unsortedcategories = {}
        var sortedcategories = {}
        var commandcount = 0

        //Pre-configure message
        msg = { 
            embeds: [{
                title: `${lf.help} - ${lf.commandlist}`,
                color: fn.randomhex(),
                thumbnail: { url: bot.user.avatarURL() },
                fields: [],
                footer: { icon_url: message.author.displayAvatarURL(), text: `${lang.general.requestedby} ${message.author.username}` },
                timestamp: Date.now()
            }]
        }

        //Get all unsortedcategories into array
        commandsObj.forEach(e => {
            //Check if cmd is test and ignore it
            if (e.info.names[0] == "test") return;

            //Check if category is Botowner and ignore it if the user shouldn't be me (just to keep the msg shorter/more relevant)
            if (e.info.category == "Botowner" && message.author.id !== "231827708198256642") return;

            //Check if command is a music command and hide it if the guild isn't allowed to use them
            if (e.info.allowedguilds && !e.info.allowedguilds.includes(message.guild.id)) return;

            //Create new Array for category if it doesn't exist yet
            if (!unsortedcategories[e.info.category]) unsortedcategories[e.info.category] = []

            //Check if this iteration is an alias cmd by checking this value that was added in the cmd reading process
            if (e.info.thisisanalias == true) return;

            //Count!
            commandcount++
            
            //Add command to existing Category Array
            unsortedcategories[e.info.category].push(`\`${guildsettings.prefix}${e.info.names[0]}\` - ${require("lodash").get(lang, e.info.description)}`) //lodash is able to replace the obj path in the str with the corresponding item in the real obj. Very cool!
        });

        //Put counted commands into description
        msg.embeds[0].description = `__${lf.overviewofxcmds.replace("commandcount", `**${commandcount}**`)}__:\n${lf.detailedcommandinfo.replace("prefix", guildsettings.prefix)}`

        //Sort Object by order defined in config
        bot.config.helpcategoryorder.forEach((e) => {
            if (e == "other") { //Check if this key is the key for all categories with no specific order
                Object.keys(unsortedcategories).forEach((k) => { //Loop over all categories
                    if (!bot.config.helpcategoryorder.includes(k)) { //Check if this is one of the categories with no specific order
                        sortedcategories[k] = unsortedcategories[k] //Just add it
                    }
                })
            } else {
                //Check if category is Botowner and ignore it if the user shouldn't be me (just to keep the msg shorter/more relevant)
                if (e == "Botowner" && message.author.id !== "231827708198256642") return;

                sortedcategories[e] = unsortedcategories[e] //Add Category to Object
            }
        })

        //Add sortedcategories with commands to msg
        Object.keys(sortedcategories).forEach((e) => {
            var categorytitle = lf[e.toLowerCase()] //get translated category name from language file
            if (!categorytitle) var categorytitle = e //if language file doesn't have this category just use the "raw" name

            msg.embeds[0].fields.push({ 
                name: categorytitle,
                value: sortedcategories[e].join("\n") //the dynamically created value array must be converted back to a String so we join them with a line break in order that the commands are listed below eachother
            })
        })

        //Finally send message
        message.channel.send(msg)
    }
}

module.exports.info = {
    names: ["help", "h", "commands"],
    description: "cmd.help.infodescription",
    usage: "[command name]",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}