module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")

    if (args[0] === undefined) {
        message.channel.send("Please provide a city name!")
        return;
    }

    var city = args.slice(0).join(" ")

    try {
        const { body } = await v.superagent
        .get('http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=8487951e4d417abb735100d7075b1e42')

        if (body.weather[0].main == body.weather[0].description) {
            var weather = body.weather[0].main
        } else {
            var weather = body.weather[0].main + " (" + body.weather[0].description + ")"
        }

        message.channel.send({embed:{
            title: "Weather in " + city,
            color: v.randomhex(),
            thumbnail: {
                url: "http://openweathermap.org/img/w/" + body.weather[0].icon + ".png"
            },
            fields: [
                {
                    name: "Name:",
                    value: "" + body.name,
                    inline: true
                },
                {
                    name: "Country:",
                    value: "" + body.sys.country,
                    inline: true
                },
                {
                    name: "Weather:",
                    value: "" + weather,
                    inline: true
                },
                {
                    name: "Clouds:",
                    value: "" + body.clouds.all + " %",
                    inline: true
                },
                {
                    name: "Temperature:",
                    value: v.round(body.main.temp - 273,2) + " °C | " + v.round(body.main.temp * 1.8 - 459.67,2) + " °F",
                    inline: true
                },
                {
                    name: "Wind Speed:",
                    value: "" + body.wind.speed + " m/s",
                    inline: true
                },
                {
                    name: "Wind Degree:",
                    value: "" + body.wind.deg,
                    inline: true
                }
            ],
            timestamp: message.createdAt
        }})
    } catch (err) {
        message.channel.send("Weather API Error: " + err)
        return;
    }
}

module.exports.config = {
    command: "weather"
}