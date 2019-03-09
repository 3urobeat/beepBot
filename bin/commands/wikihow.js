module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    
    var request = require('request');
    if (args[0] === undefined) {
        var language = "en";
    } else {
        var language = args[0]

        switch(args[0].toLowerCase()) {
            case "languages":
                message.channel.send("Supported languages: english (default), german, español, français, हिन्दी, indonesia, italiano, nederlands, português, pусский (or use 'russian'), العربية, ไทย, 한국어, 中文.")
                return;
            case "english":
                var language = "en"
                break;
            case "german":
                var language = "de"
                break;
            case "español":
                var language = "es"
                break;
            case "français":
                var language = "fr"
                break;
            case "हिन्दी":
                var language = "hi"
                break
            case "indonesia":
                var language = "id"
                break;
            case "italiano":
                var language = "it"
                break;
            case "nederlands":
                var language = "nl"
                break;
            case "português":
                var language = "pt"
                break;
            case "pусский":
                var language = "ru"
                break;
            case "russian":
                var language = "ru"
                break;
            case "العربية":
                var language = "ar"
                break;
            case "ไทย":
                var language = "th"
                break;
            case "한국어":
                var language = "ko"
                break;
            case "中文":
                var language = "zh"
                break;
        }
    }

    var r = request.get('https://' + language + '.wikihow.com/Special:Randomizer', function (err) {
        if (err) { message.channel.send("Error: " + err); console.log("Error: " + err); return; }
        message.channel.send(r.uri.href);
    })

}

module.exports.config = {
    command: "wikihow",
    alias: "wh",
}