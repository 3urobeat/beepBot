module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    let lf = lang.cmd.movemsg

    if (!args[0] && !message.reference) return message.channel.send(lf.missingargs)
    
    //get message to move
    if (message.reference) { //check if user replied to the message
        var msgid = message.reference.messageID
        args.unshift(msgid) //add msgid to beginning of the array so that the next channelcheck doesn't get confused because otherwise the channel arg would now be index 0 and not 1
    } else if (args[0].startsWith("https://discord.com/channels/")) { //check if user linked the message
        var newargs = args[0].toLowerCase().replace("https://discord.com/channels/", "").split("/")
        if (newargs[0] != message.guild.id || newargs[1] != message.channel.id) return message.channel.send(lf.wrongchannel)

        var msgid = newargs[2]
    } else if (args[0].length === 18 && /^\d+$/.test(args[0])) var msgid = args[0] //Check if user provided the message id
    
    //get channel to move msg to
    if (!args[1]) return message.channel.send(lf.missingchannel)
    try {
        if (args[1].length === 18 && /^\d+$/.test(args[1])) { //Check if the arg is 18 chars long and if it is a number
            var movechannelid = args[1].toString()
        } else if (args[1].match(/(?<=<#)[0-9]{18}?(?=>)/g)) { // <#18numbers>
            var movechannelid = args[1].toString().replace(/[<#>]/g, "")
        } else { var movechannelid = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args[1].toLowerCase()).id } //not a channelid so try and find by name (channelnames can't have spaces so no need to join array)
    } catch (err) {
        return message.channel.send(lf.channelnotfound) }

    //get reason if there is one
    if (args[2]) var movereason = args.slice(2).join(" ")
        else var movereason = "/"

    if (movereason.length >= 1500) var movereason = movereason.slice(0, 1500) + '...' //don't want the footer to be longer than 1500 (although it supports up to 2048 but wtf and even 1500 is way too long)

    //get the message to move
    var originalmsg = await message.channel.messages.fetch(String(msgid))
    if (!originalmsg) return message.channel.send(lf.messagenotfound)

    var originalcontent = originalmsg.content
    if (originalcontent.length < 1) originalcontent = lf.seeattachmentbelow //add note if original message didn't have text and only an attachment
        else if (originalmsg.attachments.array().length > 0) originalcontent += `\n\n${lf.seeattachmentbelow}` //add note two lines below content if message had content and an attachment

    const embed = {
        title: lf.title.replace("username", `${originalmsg.author.username}#${originalmsg.author.discriminator}`).replace("channelname", `#${message.channel.name}`),
        fields: [{
            name: `${lf.fieldname.replace("time", (new Date(originalmsg.createdTimestamp)).toISOString().replace(/T/, ' ').replace(/\..+/, ''))}:`, //"original msg" from utc time
            value: originalcontent }], //original msg content
        footer: {
            icon_url: message.author.displayAvatarURL(),
            text: `${lf.movedby.replace("author", `${message.author.username}#${message.author.discriminator}`)} • ${lang.general.reason}: ${movereason}` } //moved by and reason
    }

    message.guild.channels.cache.get(movechannelid).send({ embed: embed, files: originalmsg.attachments.array() }) //if no attachments in original msg then the array will be empty
        .then(() => {
            message.delete().catch(err => { message.channel.send(`${lf.errordeletingmsg}: ${err}`) })
            originalmsg.delete().catch(err => { message.channel.send(`${lf.errordeletingmsg}: ${err}`) })

            fn.msgtomodlogchannel(message.guild, "movemsg", message.author, originalmsg.author, [originalcontent, originalmsg.attachments.array(), movereason]) //pass information to modlog function
        })
        .catch(err => { return message.channel.send(`${lf.errormovingmsg}: ${err}`) })

}

module.exports.info = {
    names: ["movemsg", "movemessage"],
    description: "Moves a message from someone to another channel.",
    usage: "(use cmd in reply/message id/message link) (channelname/channelmention) [-r reason]",
    accessableby: ['moderators'],
    allowedindm: false,
    nsfwonly: false
}