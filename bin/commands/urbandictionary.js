module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    try {
        if (args[0] === undefined) {
            message.channel.send("Please provide a word to search!")
            return;
        }

        var word = args.slice(0).join(" ")

        const { body } = await v.superagent
        .get('http://urbanscraper.herokuapp.com/define/' + word)
        console.log('http://urbanscraper.herokuapp.com/define/' + word)

        var bodyurl = body.url.replace(/\s/g, '')

        message.channel.send({embed:{
            title: body.term.charAt(0).toUpperCase() + body.term.slice(1) + " - Urban Dictionary",
            url: bodyurl,
            color: v.randomhex(),
            fields: [
                {
                    name: "Definition:",
                    value: "** **\n" + body.definition + "\n** **"
                },
                {
                    name: "Example:",
                    value: "** **\n" + body.example + "\n** **"
                }
            ],
            footer: {
                text: "by " + body.author
              },
            timestamp: body.posted
        }}).catch(err => {
            message.channel.send("Error sending message: " + err)
            console.log("urbandictionary sending message Error: " + err)
            return;
        })
    } catch (err) {
        message.channel.send("UrbanDictionary API Error: " + err)
    }

    }

module.exports.config = {
    command: "urbandictionary",
    alias: "ud"
}