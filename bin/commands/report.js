module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const index = require("../index.js")
    
    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return;
    }

    let reportMember = message.guild.member(message.mentions.members.first());
    let reportReason = args.slice(1).join(" ");

    if (message.mentions.users.size === 0) {
        message.channel.send("Please mention a valid user!")
        return;
    } else {
        if(!reportMember) {
            message.channel.send("That user does not seem valid.")
            return; }}
    if (reportMember.id == v.bot.user.id) {
        message.channel.send(v.randomstring(["I won't report myself what are you thinking?! :angry:","I don't like you anymore.","No. :angry:","Dont fight me with my own weapons!","Is there a way to block you?","Could someone kick this guy?"]))
        return; }
    if (reportMember.id == message.author.id) {
        message.channel.send("You can't report yourself. :facepalm:")
        return; }

    if (args[1] === undefined) {
        message.channel.send("Please provide a reason!")
        return; }
    
    message.guild.owner.send({embed:{
        fields: [{
            name: "New report from " + message.guild.name + "!",
            value: "Details:\n\n**Author:** " + message.author.username + "\n**Reported user:** " + reportMember.user.username + "\n**Reason:** " + reportReason + "\n**Channel:** " + message.channel
          }
        ],
        thumbnail: {
            url: reportMember.user.displayAvatarURL
        },
        timestamp: new Date(),
        color: 0xFF0000
    }}).catch(err => {
        message.author.send("A error occured sending your report to the server owner! Error: " + err)
        return;
    })
    message.channel.send("Your report has been sent.\n\nReport details:\n  **Reported user:** " + reportMember.user.username + "\n  **Reason:** " + reportReason + "\n  **Channel:** " + message.channel)

}

module.exports.config = {
    command: "report"
}