module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line   
    if (!args[0]) message.channel.send(lang.cmd.otherfun.achievementmissingargs)

    let title = lang.cmd.otherfun.achievementtitle
    let contents = args.join(" ")
    let rnd = Math.floor((Math.random() * 39) + 1);
    
    if (contents.length > 22) return message.channel.send(lang.cmd.otherfun.achievementtoolongtext)

    let url = `https://www.minecraftskinstealer.com/achievement/a.php?i=${rnd}&h=${encodeURIComponent(title)}&t=${encodeURIComponent(contents)}`
    require("node-fetch")(url)
        .then(res => { message.channel.send("", { files: [{ attachment: res.body }] }) })
        .catch(err => {
            if (err) { //lets check that before successful requests get logged as "null" error
                logger("error", "achievement.js", "API Error: " + err)
                message.channel.send(`minecraftskinstealer.com API ${lang.general.error}: ${err}`) } })
}

module.exports.info = {
    names: ["achievement"],
    description: "cmd.otherfun.achievementinfodescription",
    usage: "(text)",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}