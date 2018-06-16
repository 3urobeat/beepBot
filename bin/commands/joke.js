module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    var request = require('request');

    try {
        var headers = {
            'Accept': 'text/plain'
        };
        
        var options = {
            url: 'https://icanhazdadjoke.com/',
            headers: headers
        };
        
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                message.channel.send(body);
            }
        }
        
        request(options, callback);
    } catch (err) {
        console.log("Joke API Error: " + err)
        message.channel.send("Joke API Error: " + err)
    }
      
    }

module.exports.config = {
    command: "joke"
}