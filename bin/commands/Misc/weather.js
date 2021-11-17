module.exports.run = async (bot, message, args, lang, logger, guildsettings, fn) => { //eslint-disable-line
    let lf = lang.cmd.weather

    if (!args[0]) return message.channel.send(lf.missingargs)

    let cityname = args.join(" ")
    let token = require("../../../../token.json").openweathermapapitoken //nice path bro



    //Yes this bot will probably never support so many languages but since it should be as dynamic and scaleable as possible try and get a fitting language
    //lang doc: https://openweathermap.org/current#multi
    let supportedlangs = {
        "afrikaans": "af",
        "albanian": "al",
        "arabic": "ar",
        "azerbaijani": "az",
        "basque": "eu",
        "brasil": "pt_br",
        "bulgarian": "bg",
        "catalan": "ca",
        "chinese": "zh_cn",
        "croatian": "hr",
        "czech": "cz",
        "danish": "da",
        "dutch": "nl",
        "english": "en",
        "finnish": "fi",
        "french": "fr",
        "galician": "gl",
        "german": "de",
        "greek": "el",
        "hebrew": "he",    
        "hindi": "hi",
        "hungarian": "hu",
        "indonesian": "id",
        "italian": "it",
        "japanese": "ja",
        "korean": "kr",
        "latvian": "la",
        "lithuanian": "lt",
        "macedonian": "mk",
        "norwegian": "no",
        "persian": "fa",
        "polish": "pl",
        "portuguese": "pt",
        "romanian": "ro",
        "russian": "ru",
        "swedish": "se",
        "slovak": "sk",
        "slovenian": "sl",
        "spanish": "es",
        "serbian": "sr",
        "thai": "th",
        "turkish": "tr",
        "ukrainian": "uk",
        "vietnamese": "vi",
        "zulu": "zu"
    }

    //get lang code from obj or set english if the language isn't supported/found
    if (supportedlangs[guildsettings.lang]) var thislang = supportedlangs[guildsettings.lang]
        else var thislang = supportedlangs["english"]
    
    try {
        let { body } = await require("superagent").get(`http://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${token}&lang=${thislang}`)

        let deg = body.wind.deg

        //wind degree to word (I AM REALLY NOT PROUD OF THIS SWITCH CASE BLOCK) - calculation sauce: http://snowfence.umn.edu/Components/winddirectionanddegrees.htm
        switch (true) {
            case deg > 348.75 || deg >= 0 && deg <= 11.25: //looks a bit stupid because the circle only has 360° (no shit)
                var degstr = lf.north
                break;
            case deg > 11.25 && deg <= 33.75:
                var degstr = lf.north + lf.north + lf.east //results in NNE
                break;
            case deg > 33.75 && deg <= 56.25:
                var degstr = lf.north + lf.east
                break;
            case deg > 56.25 && deg <= 78.75:
                var degstr = lf.east + lf.north + lf.east
                break;
            case deg > 78.75 && deg <= 101.25:
                var degstr = lf.east
                break;
            case deg > 101.25 && deg <= 123.75:
                var degstr = lf.east + lf.south + lf.east
                break;
            case deg > 123.75 && deg <= 146.25:
                var degstr = lf.south + lf.east
                break;
            case deg > 146.25 && deg <= 168.75:
                var degstr = lf.south + lf.south + lf.east
                break;
            case deg > 168.75 && deg <= 191.25:
                var degstr = lf.south
                break;
            case deg > 191.25 && deg <= 213.75: 
                var degstr = lf.south + lf.south + lf.west
                break;
            case deg > 213.75 && deg <= 236.25: 
                var degstr = lf.south + lf.west
                break;
            case deg > 236.25 && deg <= 258.75: 
                var degstr = lf.west + lf.south + lf.west
                break;
            case deg > 258.75 && deg <= 281.25: 
                var degstr = lf.west
                break;
            case deg > 281.25 && deg <= 303.75:
                var degstr = lf.west + lf.north + lf.west
                break;
            case deg > 303.75 && deg <= 326.25:
                var degstr = lf.north + lf.west
                break;
            case deg > 326.25 && deg <= 348.75:
                var degstr = lf.north + lf.north + lf.west
                break; }

        //make visibility units nicer
        if (body.visibility > 1000) var visibility = fn.round(body.visibility / 1000, 1) + " km"
            else var visibility = body.visibility + " m"

        message.channel.send({embeds: [{
            title: lf.weatherincity.replace("cityname", `${body.name} (${body.sys.country})`) + ":",
            color: fn.randomhex(),
            thumbnail: {
                url: "http://openweathermap.org/img/w/" + body.weather[0].icon + ".png"
            },
            fields: [
                {
                    name: `${lf.weather}:`,
                    value: body.weather[0].description },
                {
                    name: `${lf.cloudcoverage}:`,
                    value: body.clouds.all + " %" },
                {
                    name: `${lf.temperature}:`,
                    value: `${fn.round(body.main.temp - 273,2)} °C | ${fn.round(body.main.temp * 1.8 - 459.67,2)} °F` },
                {
                    name: `${lf.visibility}:`,
                    value: visibility },
                {
                    name: `${lf.wind}:`,
                    value: `${body.wind.speed} m/s\n${degstr} (${body.wind.deg}°)` }],
            footer: {
                text: `${lang.general.poweredby} OpenWeatherMap API` },
            timestamp: message.createdAt
        }] })
    } catch (err) {
        if (err == "Error: Not found") return message.channel.send(lf.notfound)

        logger("error", "weather.js", "API Error: " + err)
        message.channel.send(`openweathermap.org API ${lang.general.error}: ${err}`) }
}

module.exports.info = {
    names: ["weather"],
    description: "cmd.weather.infodescription",
    usage: "(city name)",
    accessableby: ['all'],
    allowedindm: true,
    nsfwonly: false
}