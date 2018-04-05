module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const fs = v.fs
    
    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return;
    }
    let banMember = message.guild.member(message.mentions.members.first());
    if (message.guild.owner.id !== message.author.id) {
        if (banMember.highestRole.position >= message.member.highestRole.position) { message.channel.send("You cannot ban a member who is higher or has the same role as you."); return; }}
        
    if (message.mentions.users.size === 0) {
        message.channel.send("Please mention a valid user!")
        return;
    } else {
        if(!banMember) {
            message.channel.send("That user does not seem valid.")
            return; }}
    if (banMember.id == v.bot.user.id) {
        message.channel.send(v.randomstring(["I won't ban myself what are you thinking?! :angry:","I don't like you anymore.","No. :angry:","Dont fight me with my own weapons!","Is there a way to block you?","Could someone kick this guy?"]))
        return; }
    if (banMember.id == message.author.id) {
        message.channel.send("You can't softban yourself. :facepalm:")
        return; }
    if (message.member.permissions.has("BAN_MEMBERS", "ADMINISTRATOR")) {
        let banauthor = message.author

        //perm ban code
        if (args[1] === undefined) {
            var banreasontext = "/"
            var banreason = ""
        } else {
            var banreason = args.slice(1).join(" ");
            var banreasontext = args.slice(1).join(" ");
        }

        banMember.ban(banreason).then(member => {
        message.channel.send(banMember + " was softbanned. __Reason:__ " + banreasontext)
        banMember.send("You got banned from **" + message.guild.name + "** by " + banauthor + " for this reason: " + banreasontext)
        banMember.guild.unban(banMember, "Softban")
        }).catch(err => {
            message.channel.send("An error occured: " + err)
        })
        
    } else {
        message.channel.send(v.usermissperm())
    }


}

module.exports.config = {
    command: "softban"
}
