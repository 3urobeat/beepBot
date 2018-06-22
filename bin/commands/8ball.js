module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    if (args[0] === undefined) {
        message.channel.send("8ball can't decide.").catch(err => {
            console.log("8ball send no args message error: " + err)
        })
        return;
    }
    if (askedbefore === args.slice(0).join("")) { message.channel.send("You asked me that before! :expressionless: :unamused: ").catch(err => {console.log("8ball send askedbefore error message error: " + err)}); return; }
    
    await message.channel.send(":8ball: " + v.randomstring(["Yes","Yos!","Yep.","Outlook good","Most definitely yes","My sources say yes","I think yes","No","Definitely no","Probably not","Nope","My sources say no","Dont even think about it","Most likely no","Not sure","Maybe","I'll think about it..."])).then(askedbefore = args.slice(0).join(" ")).catch(err => {
        console.log("8ball send message error: " + err)
    })

}

module.exports.config = {
    command: "8ball"
}