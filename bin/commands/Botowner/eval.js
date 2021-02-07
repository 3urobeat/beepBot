module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    const clean = text => {
        if (typeof(text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else return text; }
      
    try {
        const code = args.join(" ");
        let evaled = eval(code);

        if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);

        message.channel.send(clean(evaled), {code:"xl"}).catch(err => {
            message.channel.send("Error: " + err) })
    } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        message.react("❌").catch(() => { }) //catch but ignore error
        return; }
    message.react("✅").catch(() => { }) //catch but ignore error
}

module.exports.info = {
    names: ["eval"],
    description: "cmd.otherbotowner.evalinfodescription",
    accessableby: ['botowner'],
    allowedindm: true,
    nsfwonly: false
}