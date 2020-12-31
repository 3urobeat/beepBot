module.exports.run = (bot, message, args, lang, logger, guildsettings, fn) => {
    const Discord = require("discord.js")
    var guildid   = message.guild.id
    var none      = "**/**"
    let lf        = lang.cmd.settings

    function logDbErr(err) { //Avoids having to copy paste the same msg and makes changing it easier
        logger("error", "settings.js", `Error updating db of guild ${guildid}. Error: ${err}`) }

    /* --------------- Read settings for this guild --------------- */

    //adminroles, moderatorroles & memberaddroles
    if (guildsettings.adminroles.length > 0) {
        var adminroles = new String
        for(i = 0; i < guildsettings.adminroles.length; i++) { //< and not <= because i is one lower than length
            if (i < 1) adminroles += `<@&${message.guild.roles.cache.get(guildsettings.adminroles[i]).id}>`
                else adminroles += `, <@&${message.guild.roles.cache.get(guildsettings.adminroles[i]).id}>` }
    } else { var adminroles = none }

    if (guildsettings.moderatorroles.length > 0) {
        var moderatorroles = new String
        for(i = 0; i < guildsettings.moderatorroles.length; i++) { //< and not <= because i is one lower than length
            if (i < 1) moderatorroles += `<@&${message.guild.roles.cache.get(guildsettings.moderatorroles[i]).id}>`
                else moderatorroles += `, <@&${message.guild.roles.cache.get(guildsettings.moderatorroles[i]).id}>` }  
    } else { var moderatorroles = none }

    if (guildsettings.memberaddroles.length > 0) {
        var memberaddroles = new String
        for(i = 0; i < guildsettings.memberaddroles.length; i++) { //< and not <= because i is one lower than length
            if (i < 1) memberaddroles += `<@&${message.guild.roles.cache.get(guildsettings.memberaddroles[i]).id}>`
                else memberaddroles += `, <@&${message.guild.roles.cache.get(guildsettings.memberaddroles[i]).id}>` }  
    } else { var memberaddroles = none }

    //systemchannel
    if (guildsettings.systemchannel) var systemchannel = `<#${message.guild.channels.cache.get(guildsettings.systemchannel).id}>`
        else {  if (message.guild.systemChannel !== null) {
                    var systemchannel = `${none} - ${lf.recommendation}: \`#${message.guild.systemChannel.name}\``
                } else {
                    var systemchannel = none } }

    //modlogchannel
    if (guildsettings.modlogchannel) var modlogchannel = `<#${message.guild.channels.cache.get(guildsettings.modlogchannel).id}>`
        else { var modlogchannel = none }
    
    //greetmsg & byemsg
    if (!guildsettings.greetmsg) var greetmsg = none
        else var greetmsg = guildsettings.greetmsg

    if (!guildsettings.byemsg) var byemsg = none
        else var byemsg = guildsettings.byemsg



    /* --------------- Code to customize settings --------------- */
        
    function roleid() {
        try { //get and set roleid once to make code cleaner
            if (!args[2]) { return message.channel.send(lf.adminmodmemberaddroleusage) }
            if (args[2].length === 18 && /^\d+$/.test(args[2])) { //Check if the arg is 18 chars long and if it is a number
                return roleid = args[2].toString() 
            } else { return roleid = message.guild.roles.cache.find(role => role.name.toLowerCase() === args.slice(2).join(" ").toLowerCase()).id } //not a roleid so try and find by name
        } catch (err) { 
            message.channel.send(`${lf.roleerror}.\n||\`${err}\`||`)
            return
        }}

    if (!args[0]) { args[0] = "" }
    switch(args[0].toLowerCase()) {
        case "help":
            var PREFIX = guildsettings.prefix

            //indentation looks stupid because otherwise the resulting message would have a ton spaces infront of every cmd
            // \` is to apply markdown to message without using some kind of string feature (like ending the ` String message)
            message.channel.send(`
${lang.cmd.help.help}: 
\`${PREFIX}settings\` - ${lf.helpview}

\`${PREFIX}settings prefix "prefix"\` - ${lf.helpprefixset}
\`${PREFIX}settings lang "${lang.general.language}"\` - ${lf.helplangset}
\`${PREFIX}settings adminroles [add/remove/removeall] "${lf.rolename}"\` - ${lf.helpadminrolesset}
\`${PREFIX}settings modroles [add/remove/removeall] "${lf.rolename}"\` - ${lf.helpmodrolesset}
\`${PREFIX}settings systemchannel [set/remove] "${lf.channelname}"\` - ${lf.helpsystemchannelset}
\`${PREFIX}settings greetmsg [set/remove] "${lang.general.message}"\` - ${lf.helpgreetmsgset}
\`${PREFIX}settings byemsg [set/remove] "${lang.general.message}"\`- ${lf.helpbyemsgset}
\`${PREFIX}settings joinroles [add/remove/removeall] "${lf.rolename}"\` - ${lf.helpjoinrolesset}
\`${PREFIX}settings reset\` - ${lf.helpsettingsreset}

${lf.helpadvice}
            `)
            break;
        case "prefix":
            //are there unsupported prefixes? use this! error msg: lf.prefixnotsupported
            if (args[1] === undefined || args[1] === " ") return message.channel.send(`${lf.prefixmissingargs}.`)
            if (message.guild.members.cache.get(bot.user.id).nickname === null) var nickname = bot.user.username 
                else var nickname = message.guild.members.cache.get(bot.user.id).nickname.replace(` [${guildsettings.prefix}]`, "")

            bot.settings.update({ guildid: guildid }, { $set: { prefix: args[1] }}, {}, (err) => { if (err) logDbErr(err) })
            message.guild.members.cache.get(bot.user.id).setNickname(`${nickname} [${args[1]}]`).catch(err => { message.channel.send("I couldn't add my new Prefix to my nickname. Tip: You can also mention me instead of using a prefix if you should forget it.\nError: " + err) })
            message.channel.send(`${lf.newprefixset}: ${args[1]}`)
            break;
        case "language":
        case "lang":
            if (!args[1]) { args[1] = "" }
            if (!Object.keys(bot.langObj).includes(args[1].toLowerCase())) {
                message.channel.send(`${lf.supportedlang}: \n${Object.keys(bot.langObj).join("\n").split(".json").join("") }`)
            } else {
                bot.settings.update({ guildid: guildid }, { $set: { lang: args[1].toLowerCase() }}, {}, (err) => { if (err) logDbErr(err) })
                message.channel.send(`${bot.langObj[args[1].toLowerCase()].cmd.settings.newlangsaved}.`) }
            break;
        case "adminroles":
        case "adminrole":
            if (!args[1]) { args[1] = "" }
            switch(args[1].toLowerCase()) {
                case "add":
                    var roleid = roleid();
                    if (guildsettings.adminroles.includes(roleid)) return message.channel.send(lf.rolealreadyadded)
                    bot.settings.update({ guildid: guildid }, { $push: { adminroles: roleid }}, {}, (err) => { if (err) logDbErr(err) })
                    message.channel.send(`${lf.roleadded}: ${message.guild.roles.cache.get(roleid).name} (${roleid})`)
                    break;
                case "remove":
                    var roleid = roleid();
                    if (!guildsettings.adminroles.includes(roleid)) return message.channel.send(lf.rolenotincluded)
                    bot.settings.update({ guildid: guildid }, { $pull: { adminroles: roleid }}, {}, (err) => { if (err) logDbErr(err) })
                    message.channel.send(`${lf.roleremoved}: ${message.guild.roles.cache.get(roleid).name} (${roleid})`)
                    break;
                case "removeall":
                    if (guildsettings.adminroles.length === 0) return message.channel.send(lf.rolearrayempty)
                    const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 10000});
                    message.channel.send(lang.general.areyousure)
                    collector.on('collect', message => {
                        if (message.content == "y") {
                            bot.settings.update({ guildid: guildid }, { $set: { adminroles: [] }}, {}, (err) => { if (err) logDbErr(err) })
                            message.channel.send(lf.rolearraycleared) } });
                    break;
                default:
                    message.channel.send(lf.adminmodmemberaddroleusage)
                    return; }
            break;
        case "moderatorroles":
        case "moderatorrole":
        case "modroles":
        case "modrole":
            if (!args[1]) { args[1] = "" }
            switch(args[1].toLowerCase()) {
                case "add":
                    var roleid = roleid();
                    if (guildsettings.moderatorroles.includes(roleid)) return message.channel.send(lf.rolealreadyadded)
                    bot.settings.update({ guildid: guildid }, { $push: { moderatorroles: roleid }}, {}, (err) => { if (err) logDbErr(err) })
                    message.channel.send(`${lf.roleadded}: ${message.guild.roles.cache.get(roleid).name} (${roleid})`)
                    break;
                case "remove":
                    var roleid = roleid();
                    if (!guildsettings.moderatorroles.includes(roleid)) return message.channel.send(lf.rolenotincluded)
                    bot.settings.update({ guildid: guildid }, { $pull: { moderratorroles: roleid }}, {}, (err) => { if (err) logDbErr(err) })
                    message.channel.send(`${lf.roleremoved}: ${message.guild.roles.cache.get(roleid).name} (${roleid})`)
                    break;
                case "removeall":
                    if (guildsettings.moderatorroles.length === 0) return message.channel.send(lf.rolearrayempty)
                    const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 10000});
                    message.channel.send(lang.general.areyousure)
                    collector.on('collect', message => {
                        if (message.content == "y") {
                            bot.settings.update({ guildid: guildid }, { $set: { moderratorroles: [] }}, {}, (err) => { if (err) logDbErr(err) })
                            message.channel.send(lf.rolearraycleared) } });
                    break;
                default:
                    message.channel.send(lf.adminmodmemberaddroleusage)
                    return; }
            break;
        case "systemchannel":
            if (!args[1]) { args[1] = "" }
            switch(args[1].toLowerCase()) {
                case "set":
                    try {
                        if (!args[2]) { return message.channel.send(lf.systemchannelusage) }
                        if (args[2].length === 18 && /^\d+$/.test(args[2])) { //Check if the arg is 18 chars long and if it is a number
                            var channelid = args[2].toString()
                        } else if (args[2].match(/(?<=<#)[0-9]{18}?(?=>)/g)) { // <#18numbers>
                            var channelid = args[2].toString().replace(/[<#>]/g, "")
                        } else { var channelid = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.slice(2).join(" ").toLowerCase()).id } //not a roleid so try and find by name
                    } catch (err) { return message.channel.send(`${lf.channelerror}.\n||\`${err}\`||`) }

                    bot.settings.update({ guildid: guildid }, { $set: { systemchannel: channelid }}, {}, (err) => { if (err) logDbErr(err) })
                    message.channel.send(`${lf.channelset}: ${message.guild.channels.cache.get(channelid).name} (${channelid})`)
                    break;
                case "remove":
                    if (!guildsettings.systemchannel) return message.channel.send(lf.channelnotset)
                    bot.settings.update({ guildid: guildid }, { $set: { systemchannel: null }}, {}, (err) => { if (err) logDbErr(err) })
                    message.channel.send(lf.channelremoved)
                    break;
                default:
                    message.channel.send(lf.systemchannelusage)
                    return; }
            break;
        case "modlogchannel":
            if (!args[1]) { args[1] = "" }
            switch(args[1].toLowerCase()) {
                case "set":
                    try {
                        if (!args[2]) { return message.channel.send(lf.modlogchannelusage) }
                        if (args[2].length === 18 && /^\d+$/.test(args[2])) { //Check if the arg is 18 chars long and if it is a number
                            var channelid = args[2].toString()
                        } else if (args[2].match(/(?<=<#)[0-9]{18}?(?=>)/g)) { // <#18numbers>
                            var channelid = args[2].toString().replace(/[<#>]/g, "")
                        } else { var channelid = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.slice(2).join(" ").toLowerCase()).id } //not a roleid so try and find by name
                    } catch (err) { return message.channel.send(`${lf.channelerror}.\n||\`${err}\`||`) }

                    bot.settings.update({ guildid: guildid }, { $set: { modlogchannel: channelid }}, {}, (err) => { if (err) logDbErr(err) })
                    message.channel.send(`${lf.channelset}: ${message.guild.channels.cache.get(channelid).name} (${channelid})`)
                    break;
                case "remove":
                    if (!guildsettings.modlogchannel) return message.channel.send(lf.channelnotset)
                    bot.settings.update({ guildid: guildid }, { $set: { modlogchannel: null }}, {}, (err) => { if (err) logDbErr(err) })
                    message.channel.send(lf.channelremoved)
                    break;
                default:
                    message.channel.send(lf.modlogchannelusage)
                    return; }
            break;
        case "greetmessage":
        case "greetmsg":
            if (!guildsettings.systemchannel) return message.channel.send(lf.greetmsgsystemchannelnotset)

            if (!args[1]) { args[1] = "" }
            switch(args[1].toLowerCase()) {
                case "set":
                    if (!args[2]) return message.channel.send(lf.greetmsgusage)
                    if (message.content.length > 150) return message.channel.send(lf.argtoolong)

                    args.splice(0, 2) //remove "greetmsg" and "set" from array

                    bot.settings.update({ guildid: guildid }, { $set: { greetmsg: String(args.join(" ")) }}, {}, (err) => { if (err) logDbErr(err) })
                    message.channel.send(lf.msgset)
                    break;
                case "remove":
                    if (guildsettings.greetmsg === null) return message.channel.send(lf.msgnotset)
                    bot.settings.update({ guildid: guildid }, { $set: { greetmsg: null }}, {}, (err) => { if (err) logDbErr(err) })
                    message.channel.send(lf.msgremoved)
                    break;
                default:
                    message.channel.send(lf.greetmsgusage)
                    return; }
            break;
        case "byemessage":
        case "byemsg":
            if (!guildsettings.systemchannel) return message.channel.send(lf.greetmsgsystemchannelnotset)

            if (!args[1]) { args[1] = "" }
            switch(args[1].toLowerCase()) {
                case "set":
                    if (!args[2]) return message.channel.send(lf.byemsgusage)
                    if (message.content.length > 150) return message.channel.send(lf.argtoolong)

                    args.splice(0, 2) //remove "byemsg" and "set" from array

                    bot.settings.update({ guildid: guildid }, { $set: { byemsg: String(args.join(" ")) }}, {}, (err) => { if (err) logDbErr(err) })
                    message.channel.send(lf.msgset)
                    break;
                case "remove":
                    if (guildsettings.byemsg === null) return message.channel.send(lf.msgnotset)
                    bot.settings.update({ guildid: guildid }, { $set: { byemsg: null }}, {}, (err) => { if (err) logDbErr(err) })
                    message.channel.send(lf.msgremoved)
                    break;
                default:
                    message.channel.send(lf.byemsgusage)
                    return; }
            break;
        case "memberaddroles":
        case "joinroles":
            if (!args[1]) { args[1] = "" }
            switch(args[1].toLowerCase()) {
                case "add":
                    var roleid = roleid();
                    if (guildsettings.memberaddroles.includes(roleid)) return message.channel.send(lf.rolealreadyadded)
                    bot.settings.update({ guildid: guildid }, { $push: { memberaddroles: roleid }}, {}, (err) => { if (err) logDbErr(err) })
                    message.channel.send(`${lf.roleadded}: ${message.guild.roles.cache.get(roleid).name} (${roleid})`)
                    break;
                case "remove":
                    var roleid = roleid();
                    if (!guildsettings.memberaddroles.includes(roleid)) return message.channel.send(lf.rolenotincluded)
                    bot.settings.update({ guildid: guildid }, { $pull: { memberaddroles: roleid }}, {}, (err) => { if (err) logDbErr(err) })
                    message.channel.send(`${lf.roleremoved}: ${message.guild.roles.cache.get(roleid).name} (${roleid})`)
                    break;
                case "removeall":
                    if (guildsettings.memberaddroles.length === 0) return message.channel.send(lf.rolearrayempty)
                    const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 10000});
                    message.channel.send(lang.general.areyousure)
                    collector.on('collect', message => {
                        if (message.content == "y") {
                            bot.settings.update({ guildid: guildid }, { $set: { memberaddroles: [] }}, {}, (err) => { if (err) logDbErr(err) }) 
                            message.channel.send(lf.rolearraycleared) } });
                    break;
                default:
                    message.channel.send(lf.memberaddroleusage)
                    return; }
            break;
        case "reset":
            const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 10000});
            message.channel.send(lang.general.areyousure)
            collector.on('collect', message => {
                if (message.content == "y") {
                    fn.servertosettings(message.guild)
                    message.channel.send(lf.settingsreset) } });
            break;


        /* --------------- Display current settings --------------- */
        default:
            message.channel.send({embed:{
                title: `${lf.settingsfor} '${message.guild.name}'`,
                color: fn.randomhex(),
                thumbnail: { url: message.guild.iconURL },
                fields: [{ 
                        name: "Prefix:", 
                        value: `\`${guildsettings.prefix}\``, 
                        inline: true }, 
                    { 
                        name: `${lang.general.language}:`, 
                        value: lang.general.thislang, 
                        inline: true },
                    { 
                        name: `${lf.adminroles}:`, 
                        value: adminroles },
                    { 
                        name: `${lf.moderatorroles}:`, 
                        value: moderatorroles },
                    { 
                        name: `${lf.systemchannel}:`,
                        value: systemchannel },
                    {
                        name: `${lf.modlogchannel}:`,
                        value: modlogchannel },
                    {
                        name: `${lf.greetmsg}:`,
                        value: greetmsg },
                    {
                        name: `${lf.byemsg}:`,
                        value: byemsg },
                    {
                        name: `${lf.addroleonjoin}:`,
                        value: memberaddroles }],
                footer: { icon_url: message.author.displayAvatarURL(), text: `${lang.general.requestedby} ${message.author.username} • ${lang.cmd.help.help}: ${guildsettings.prefix}settings help` }
            } })
            return; }
}

module.exports.info = {
    names: ["settings", "set"],
    description: "Configure the bot for your server!",
    usage: '["help"]',
    accessableby: ['admins'],
    allowedindm: false,
    nsfwonly: false
}