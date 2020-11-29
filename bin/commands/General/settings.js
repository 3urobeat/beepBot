module.exports.run = async (bot, message, args, lang, v, logger) => {
    var guildid  = message.guild.id
    var none     = "**/**"
    let lf       = lang.cmd.settings

    function writenewsettings() {
        v.fs.writeFile(v.settingspath, JSON.stringify(v.bot.settings, null, 4), err => {
            if(err) logger("error", "settings.js", 'Error writing new settings to json: ' + err) }) }


    /* --------------- Read settings for this guild --------------- */

    //adminroles, moderatorroles & memberaddroles
    if (v.bot.settings[guildid].adminroles.length > 0) {
        var adminroles = new String
        for(i = 0; i < v.bot.settings[guildid].adminroles.length; i++) { //< and not <= because i is one lower than length
            if (i < 1) adminroles += message.guild.roles.cache.get(v.bot.settings[guildid].adminroles[i]).name
                else adminroles += ", " + message.guild.roles.cache.get(v.bot.settings[guildid].adminroles[i]).name }
    } else { var adminroles = none }

    if (v.bot.settings[guildid].moderatorroles.length > 0) {
        var moderatorroles = new String
        for(i = 0; i < v.bot.settings[guildid].moderatorroles.length; i++) { //< and not <= because i is one lower than length
            if (i < 1) moderatorroles += message.guild.roles.cache.get(v.bot.settings[guildid].moderatorroles[i]).name
                else moderatorroles += ", " + message.guild.roles.cache.get(v.bot.settings[guildid].moderatorroles[i]).name }  
    } else { var moderatorroles = none }

    if (v.bot.settings[guildid].memberaddroles.length > 0) {
        var memberaddroles = new String
        for(i = 0; i < v.bot.settings[guildid].memberaddroles.length; i++) { //< and not <= because i is one lower than length
            if (i < 1) memberaddroles += message.guild.roles.cache.get(v.bot.settings[guildid].memberaddroles[i]).name
                else memberaddroles += ", " + message.guild.roles.cache.get(v.bot.settings[guildid].memberaddroles[i]).name }  
    } else { var memberaddroles = none }

    //systemchannel
    if (v.bot.settings[guildid].systemchannel !== null) var systemchannel = "#" + message.guild.channels.cache.get(v.bot.settings[guildid].systemchannel).name
        else {  if (message.guild.systemChannel !== null) {
                    var systemchannel = `${none} - ${lf.recommendation}: \`#${message.guild.systemChannel.name}\``
                } else {
                    var systemchannel = none } }
    
    //greetmsg & byemsg
    if (v.bot.settings[guildid].greetmsg === null) var greetmsg = none
        else var greetmsg = v.bot.settings[guildid].greetmsg

    if (v.bot.settings[guildid].byemsg === null) var byemsg = none
        else var byemsg = v.bot.settings[guildid].byemsg



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
            var PREFIX = v.bot.settings[guildid].prefix

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
            if (message.guild.members.cache.get(v.bot.user.id).nickname === null) var nickname = v.bot.user.username 
                else var nickname = message.guild.members.cache.get(v.bot.user.id).nickname.replace(` [${v.bot.settings[guildid].prefix}]`, "")

            v.bot.settings[guildid].prefix = args[1];
            message.guild.members.cache.get(v.bot.user.id).setNickname(`${nickname} [${args[1]}]`).catch(err => { message.channel.send("I couldn't add my new Prefix to my nickname. Tip: You can also mention me instead of using a prefix if you should forget it.\nError: " + err) })
            writenewsettings();
            message.channel.send(`${lf.newprefixset}: ${args[1]}`)
            break;
        case "language":
        case "lang":
            if (!args[1]) { args[1] = "" }
            if (!Object.keys(v.langObj).includes(args[1].toLowerCase())) {
                message.channel.send(`${lf.supportedlang}: \n${Object.keys(v.langObj).join("\n").split(".json").join("") }`)
            } else {
                v.bot.settings[guildid].lang = args[1].toLowerCase();
                writenewsettings();
                message.channel.send(`${v.langObj[args[1].toLowerCase()].cmd.settings.newlangsaved}.`) }
            break;
        case "adminroles":
        case "adminrole":
            if (!args[1]) { args[1] = "" }
            switch(args[1].toLowerCase()) {
                case "add":
                    var roleid = roleid();
                    if (v.bot.settings[guildid].adminroles.includes(roleid)) return message.channel.send(lf.rolealreadyadded)
                    v.bot.settings[guildid].adminroles.push(roleid)
                    writenewsettings();
                    message.channel.send(`${lf.roleadded}: ${message.guild.roles.cache.get(roleid).name} (${roleid})`)
                    break;
                case "remove":
                    var roleid = roleid();
                    if (!v.bot.settings[guildid].adminroles.includes(roleid)) return message.channel.send(lf.rolenotincluded)
                    v.bot.settings[guildid].adminroles = v.bot.settings[guildid].adminroles.filter(f => f !== roleid)
                    writenewsettings();
                    message.channel.send(`${lf.roleremoved}: ${message.guild.roles.cache.get(roleid).name} (${roleid})`)
                    break;
                case "removeall":
                    if (v.bot.settings[guildid].adminroles.length === 0) return message.channel.send(lf.rolearrayempty)
                    const collector = new v.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 10000});
                    message.channel.send(lang.general.areyousure)
                    collector.on('collect', message => {
                        if (message.content == "y") {
                            v.bot.settings[guildid].adminroles = []
                            writenewsettings(); 
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
                    if (v.bot.settings[guildid].moderatorroles.includes(roleid)) return message.channel.send(lf.rolealreadyadded)
                    v.bot.settings[guildid].moderatorroles.push(roleid)
                    writenewsettings();
                    message.channel.send(`${lf.roleadded}: ${message.guild.roles.cache.get(roleid).name} (${roleid})`)
                    break;
                case "remove":
                    var roleid = roleid();
                    if (!v.bot.settings[guildid].moderatorroles.includes(roleid)) return message.channel.send(lf.rolenotincluded)
                    v.bot.settings[guildid].moderatorroles = v.bot.settings[guildid].moderatorroles.filter(f => f !== roleid)
                    writenewsettings();
                    message.channel.send(`${lf.roleremoved}: ${message.guild.roles.cache.get(roleid).name} (${roleid})`)
                    break;
                case "removeall":
                    if (v.bot.settings[guildid].moderatorroles.length === 0) return message.channel.send(lf.rolearrayempty)
                    const collector = new v.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 10000});
                    message.channel.send(lang.general.areyousure)
                    collector.on('collect', message => {
                        if (message.content == "y") {
                            v.bot.settings[guildid].moderatorroles = []
                            writenewsettings(); 
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
                        } else { var channelid = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.slice(2).join(" ").toLowerCase()).id } //not a roleid so try and find by name
                    } catch (err) { return message.channel.send(`${lf.systemchannelerror}.\n||\`${err}\`||`) }
                    v.bot.settings[guildid].systemchannel = channelid;
                    writenewsettings();
                    message.channel.send(`${lf.systemchannelset}: ${message.guild.channels.cache.get(channelid).name} (${channelid})`)
                    break;
                case "remove":
                    if (v.bot.settings[guildid].systemchannel === null) return message.channel.send(lf.systemchannelnotset)
                    v.bot.settings[guildid].systemchannel = null
                    writenewsettings();
                    message.channel.send(lf.systemchannelremoved)
                    break;
                default:
                    message.channel.send(lf.systemchannelusage)
                    return; }
            break;
        case "greetmessage":
        case "greetmsg":
            if (v.bot.settings[guildid].systemchannel == null) return message.channel.send(lf.greetmsgsystemchannelnotset)

            if (!args[1]) { args[1] = "" }
            switch(args[1].toLowerCase()) {
                case "set":
                    if (!args[2]) return message.channel.send(lf.greetmsgusage)
                    if (message.content.length > 150) return message.channel.send(lf.argtoolong)

                    args.splice(0, 2) //remove "greetmsg" and "set" from array

                    v.bot.settings[guildid].greetmsg = String(args.join(" ")); //join everything together
                    writenewsettings();
                    message.channel.send(lf.msgset)
                    break;
                case "remove":
                    if (v.bot.settings[guildid].greetmsg === null) return message.channel.send(lf.msgnotset)
                    v.bot.settings[guildid].greetmsg = null
                    writenewsettings();
                    message.channel.send(lf.msgremoved)
                    break;
                default:
                    message.channel.send(lf.greetmsgusage)
                    return; }
            break;
        case "byemessage":
        case "byemsg":
            if (v.bot.settings[guildid].systemchannel == null) return message.channel.send(lf.greetmsgsystemchannelnotset)

            if (!args[1]) { args[1] = "" }
            switch(args[1].toLowerCase()) {
                case "set":
                    if (!args[2]) return message.channel.send(lf.byemsgusage)
                    if (message.content.length > 150) return message.channel.send(lf.argtoolong)

                    args.splice(0, 2) //remove "byemsg" and "set" from array

                    v.bot.settings[guildid].byemsg = String(args.join(" ")); //join everything together
                    writenewsettings();
                    message.channel.send(lf.msgset)
                    break;
                case "remove":
                    if (v.bot.settings[guildid].byemsg === null) return message.channel.send(lf.msgnotset)
                    v.bot.settings[guildid].byemsg = null
                    writenewsettings();
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
                    if (v.bot.settings[guildid].memberaddroles.includes(roleid)) return message.channel.send(lf.rolealreadyadded)
                    v.bot.settings[guildid].memberaddroles.push(roleid)
                    writenewsettings();
                    message.channel.send(`${lf.roleadded}: ${message.guild.roles.cache.get(roleid).name} (${roleid})`)
                    break;
                case "remove":
                    var roleid = roleid();
                    if (!v.bot.settings[guildid].memberaddroles.includes(roleid)) return message.channel.send(lf.rolenotincluded)
                    v.bot.settings[guildid].memberaddroles = v.bot.settings[guildid].memberaddroles.filter(f => f !== roleid)
                    writenewsettings();
                    message.channel.send(`${lf.roleremoved}: ${message.guild.roles.cache.get(roleid).name} (${roleid})`)
                    break;
                case "removeall":
                    if (v.bot.settings[guildid].memberaddroles.length === 0) return message.channel.send(lf.rolearrayempty)
                    const collector = new v.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 10000});
                    message.channel.send(lang.general.areyousure)
                    collector.on('collect', message => {
                        if (message.content == "y") {
                            v.bot.settings[guildid].memberaddroles = []
                            writenewsettings(); 
                            message.channel.send(lf.rolearraycleared) } });
                    break;
                default:
                    message.channel.send(lf.memberaddroleusage)
                    return; }
            break;
        case "reset":
            const collector = new v.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 10000});
            message.channel.send(lang.general.areyousure)
            collector.on('collect', message => {
                if (message.content == "y") {
                    v.bot.servertosettings(message.guild)
                    message.channel.send(lf.settingsreset) } });
            break;


        /* --------------- Display current settings --------------- */
        default:
            message.channel.send({embed:{
                title: `${lf.settingsfor} '${message.guild.name}'`,
                color: v.randomhex(),
                thumbnail: { url: message.guild.iconURL },
                fields: [{ 
                        name: "Prefix:", 
                        value: `\`${v.bot.settings[guildid].prefix}\``, 
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
                        name: `${lf.greetmsg}:`,
                        value: greetmsg },
                    {
                        name: `${lf.byemsg}:`,
                        value: byemsg },
                    {
                        name: `${lf.addroleonjoin}:`,
                        value: memberaddroles }],
                footer: { icon_url: message.author.displayAvatarURL(), text: `${lang.general.requestedby} ${message.author.username} • ${lang.cmd.help.help}: ${v.bot.settings[guildid].prefix}settings help` }
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