module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    message.channel.send("This error can be caused by two reasons.\nThe bot does not have enough permission on your server to execute this command or the user has a higher role in the role hierarchy of your server than the bot.\n\nYou can fix this error by giving the Bot the highest role in the role hierarchy of your server.\nThat does not mean you have to list the bot in the user list at the top. Just make the by the bot created role 'beepBot' the highest role. The bot won't be listed at the top because of the disabled feature 'Display role members seperately from online members' in the 'beepBot' role.")
}

module.exports.config = {
    command: "privilegeerror"
}