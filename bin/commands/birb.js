module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    var http = require("http")

    try {
        http.get("http://random.birb.pw/tweet/", function(res){
            res.setEncoding('utf8');
            res.on('data', function(chunk){
                message.channel.send("https://random.birb.pw/img/" + chunk).catch(err => {
                    console.log("birb send link error: " + err)
                })
            });
        });
    } catch (err) {
        console.log("Birb API Error: " + err)
        message.channel.send("Birb API Error: " + err)
    }

    }

module.exports.config = {
    command: "birb",
    alias: "bird",
    alias2: "yos"
}