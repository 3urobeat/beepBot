module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const index = require("../../index.js") 

    const help = v.fs.readFileSync(v.helppath, {"encoding": "utf-8"});
    const help2 = v.fs.readFileSync(v.helppath2, {"encoding": "utf-8"});
    message.author.send("Here is a list of all commands: :1234:\n")
    message.author.send("\n" + help)
    message.author.send("\n" + help2)
    await message.author.send("Invite me to your server: ``" + index.botinvite + "``\nYou need help? English help and german chat: https://discord.gg/q3KXW2P");
    if (message.channel.type == "dm") {
        return;
    } else {
        await message.channel.send(v.randomstring(['A list of all commands was send to you per DM. :mailbox_with_mail: :poop:','Ding! You have got an DM! :mailbox_with_mail: ','DM or Mail? I think DM is better. Here you go. :mailbox_with_mail: ','Here you go!','Have fun!','Spam is real!','Sorry, i did not spam you. Discord just does not let me post long messages.']))
    }
}

module.exports.config = {
    command: "help",
    alias: "commands"
}