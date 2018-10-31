module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return;
    }
    
    let kickMember = message.guild.member(message.mentions.members.first());
    if (message.guild.owner.id !== message.author.id) {
        if (kickMember.highestRole.position >= message.member.highestRole.position) { message.channel.send("You cannot kick a member who is higher or has the same role as you."); return; }}

    if (message.mentions.users.size === 0) {
        message.channel.send("Please mention a valid user!")
        return;
    } else {
        if(!kickMember) {
            message.channel.send("That user does not seem valid.")
            return; }}
    if (kickMember.id == v.bot.user.id) {
        message.channel.send(v.randomstring(["I won't kick myself what are you thinking?! :angry:","I don't like you anymore.","No. :angry:","Dont fight me with my own weapons!","Is there a way to block you?","Could someone kick this guy?"]))
        return; }
    if (kickMember.id == message.author.id) {
        message.channel.send("You can't kick yourself. :facepalm:")
        return; }
    if (args[1] === undefined) {
        kickreasontext = "/"
        kickreason = ""
    } else {
        kickreason = args.slice(1).join(" ");
        kickreasontext = args.slice(1).join(" ");
    }
    //Checks user perms and kick
    if (message.member.permissions.has("KICK_MEMBERS", "ADMINISTRATOR")) {
        kickMember.kick(kickreason).then(member => {
            message.channel.send(kickMember + " was kicked. __Reason:__ " + kickreasontext)
            if (!kickMember.bot) {
                kickMember.send("You got kicked from **" + message.guild.name + "** by " + message.author + " __Reason:__ " + kickreasontext).catch(err => {
                })
            }
        }).catch(err => {
            message.channel.send("An error occured: " + err)
        })

    } else {
        message.channel.send(v.usermissperm())
    }

}

module.exports.config = {
    command: "kick"
}