module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    if (message.channel.type == "dm") {
        message.channel.send(v.dmerror())
        return;
    }

    if (message.member.permissions.has("MANAGE_ROLES", "ADMINISTRATOR")) {
        if (message.mentions.users.size === 0) {
            let role = message.guild.roles.find("name", args.slice(0).join(" "))
            if (args[0] === undefined) { message.channel.send("Please provide a valid role name!"); return; }
            if (!role) { message.channel.send("That role does not seem valid."); return; }
            if (message.guild.owner.id !== message.author.id) {
                if (role.position >= message.member.highestRole.position) { message.channel.send("You cannot remove your current highest role."); return; }}
            if (!message.member.roles.has(role.id)) { message.channel.send("You don't have that role!"); return; }

            message.member.removeRole(role).catch(err => {
                message.channel.send("Error: " + err)
                return;
            })
            message.channel.send("Removed role '" + role.name + "'.")
            return;

        } else {
            let memberMention = message.mentions.members.first()
            let role = message.guild.roles.find("name", args.slice(1).join(" "))
            if (args[1] === undefined) { message.channel.send("Please provide a valid role name!"); return; }
            if (!role) { message.channel.send("That role does not seem valid."); return; }
            if (message.guild.owner.id !== message.author.id) {
                if (role.position >= message.member.highestRole.position) { message.channel.send("You cannot remove someone a role that is higher than your current highest role."); return; }}
            if (!memberMention.roles.has(role.id)) { message.channel.send("The user does not have that role!"); return; }

            memberMention.removeRole(role).catch(err => {
                message.channel.send("Error: " + err)
                return;
            })
            message.channel.send("Removed " + memberMention.toString() + " the role '" + role.name + "'.")
            return;
        }
    } else {
        message.channel.send(v.usermissperm())
        return;
    }
}

module.exports.config = {
    command: "removerole",
    alias: "remrole"
}