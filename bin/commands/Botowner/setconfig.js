module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    const fs     = require("fs")
    var   config = bot.config
    var   lf     = lang.cmd.otherbotowner

    //Code is from my Steam Comment Bot !settings cmd so I hope it doesn't look weird here - https://github.com/HerrEurobeat/steam-comment-service-bot/blob/master/src/bot.js
    if (!args[0]) {
        fs.readFile("./bin/config.json", function(err, data) { //Use readFile to get an unprocessed object
            if (err) return logger("error", "setconfig.js", `read config values error: ${err}`);

            message.channel.send(lf.setconfigcurrentsettings + ":\n" + data.toString().slice(1, -1)) //remove first and last character which are brackets
        })

        return;
    }
    
    if (!args[1]) return message.channel.send(lf.setconfigmissingargs)

    let keyvalue = config[args[0]] //save old value to be able to reset changes

    //I'm not proud of this code but whatever -> used to convert array into usable array
    if (Array.isArray(keyvalue)) {
        let newarr = []

        args.forEach((e, i) => {
            if (i == 0) return; //skip args[0]
            if (i == 1) e = e.slice(1) //remove first char which is a [
            if (i == args.length - 1) e = e.slice(0, -1) //remove last char which is a ]

            e = e.replace(/,/g, "") //Remove ,

            if (e.startsWith('"')) newarr[i - 1] = String(e.replace(/"/g, ""))
                else newarr[i - 1] = Number(e)
        })

        args[1] = newarr;
    }

    //Convert to number or boolean as input is always a String
    if (typeof(keyvalue) == "number") args[1] = Number(args[1])
    if (typeof(keyvalue) == "boolean") { //prepare for stupid code because doing Boolean(value) will always return true
        if (args[1] == "true") args[1] = true
        if (args[1] == "false") args[1] = false //could have been worse tbh
    }
    
    if (keyvalue == undefined) return message.channel.send(lf.setconfigcantfindkey)
    if (keyvalue == args[1])   return message.channel.send(lf.setconfigkeyalreadynewvalue.replace("configvalue", args[1]))

    config[args[0]] = args[1] //apply changes


    message.channel.send(lf.setconfigkeychanged.replace("configkey", `\`${args[0]}\``).replace("oldvalue", `\`${keyvalue}\``).replace("newvalue", `\`${args[1]}\``))
    logger("info", "setconfig.js", `${args[0]} has been changed from ${keyvalue} to ${args[1]}.`)

    fs.writeFile("./bin/config.json", JSON.stringify(config, null, 4), err => {
        if (err) return logger("error", "setconfig.js", `write settings cmd changes to config error: ${err}`)
        
        delete require.cache[require.resolve("../../config")]
        config = require("../../config.json")
    })
}

module.exports.info = { //Note to self: If you add more restrictions you need to add them to the restrictions field in the help cmd!
    names: ["setconfig"], //Array<String> with all aliases
    description: "cmd.otherbotowner.setconfiginfodescription", //Path to lang file entry (example: "cmd.othergeneral.pinginfodescription")
    usage: '[config value] [new value]',
    accessableby: ['botowner'], //Valid restrictions (high -> low): botowner, admins, moderators, all
    allowedindm: true,
    nsfwonly: false
}