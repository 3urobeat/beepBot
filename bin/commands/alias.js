module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    const alias = v.fs.readFileSync(v.aliaspath, {"encoding": "utf-8"});
    const alias2 = v.fs.readFileSync(v.aliaspath2, {"encoding": "utf-8"});

    try {
        await message.author.send("Here is a list of all alias commands: :1234:\n\n" + alias)
        await message.author.send("\n" + alias2)
        await message.author.send("Invite me to your server: ``" + v.botinvitelink + "``\nYou need help? English help and german chat: https://discord.gg/" + v.ssinvitecode)
    } catch (err) {
        message.channel.send("An error occured sending you a DM with a list of all aliases, including a link to my support server. \nRead all aliases here: https://github.com/HerrEurobeat/beepBot/blob/master/bin/help/aliasestext.txt \nIf you need help type *invite to get an invite to my server.").catch(err => {
            console.log("alias send error message error: " + err)
        })
        return;
    }

    if (message.channel.type == "dm") {
        return;
    } else {
        await message.channel.send(v.randomstring(['A list of all aliases was send to you per DM. :mailbox_with_mail: :poop:','Ding! You have got an DM! :mailbox_with_mail: ','DM or Mail? I think DM is better. Here you go. :mailbox_with_mail: ','Here you go!','Have fun!','Spam is real!','Sorry, i did not spam you. Discord just does not let me post long messages.']))
    }
}

module.exports.config = {
    command: "alias",
    alias: "aliases"
}