/*
 * File: weather.js
 * Project: beepbot
 * Created Date: 2021-01-12 18:34:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-12 16:16:14
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord    = require("discord.js"); // eslint-disable-line
const superagent = require("superagent");

const Bot = require("../../bot.js"); // eslint-disable-line

const token = require("../../../../token.json").openweathermapapitoken; // Nice path past-me, you could have used an absolute path instead


// Lang doc: https://openweathermap.org/current#multi
const supportedlangs = {
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
};


/**
 * The weather command
 * @param {Bot} bot Instance of this bot shard
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {object} lang The language object for this guild
 * @param {object} guildsettings All settings of this guild
 */
module.exports.run = async (bot, message, args, lang, guildsettings) => { // eslint-disable-line
    let lf = lang.cmd.weather;

    if (!args[0]) return message.channel.send(lf.missingargs);

    let cityname = args.join(" ");


    // Get lang code from obj or set english if the language isn't supported/found
    let thislang = supportedlangs["english"];

    if (supportedlangs[guildsettings.lang]) {
        thislang = supportedlangs[guildsettings.lang];
    }


    try {
        let { body } = await superagent.get(`http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityname)}&appid=${token}&lang=${thislang}`);

        let deg = body.wind.deg;
        let degstr;

        // Wind degree to word (I AM REALLY NOT PROUD OF THIS SWITCH CASE BLOCK) - calculation sauce: http://snowfence.umn.edu/Components/winddirectionanddegrees.htm
        switch (true) {
            case deg > 348.75 || deg >= 0 && deg <= 11.25: // Looks a bit stupid because the circle only has 360° (no shit)
                degstr = lf.north;
                break;
            case deg > 11.25 && deg <= 33.75:
                degstr = lf.north + lf.north + lf.east; // Results in NNE
                break;
            case deg > 33.75 && deg <= 56.25:
                degstr = lf.north + lf.east;
                break;
            case deg > 56.25 && deg <= 78.75:
                degstr = lf.east + lf.north + lf.east;
                break;
            case deg > 78.75 && deg <= 101.25:
                degstr = lf.east;
                break;
            case deg > 101.25 && deg <= 123.75:
                degstr = lf.east + lf.south + lf.east;
                break;
            case deg > 123.75 && deg <= 146.25:
                degstr = lf.south + lf.east;
                break;
            case deg > 146.25 && deg <= 168.75:
                degstr = lf.south + lf.south + lf.east;
                break;
            case deg > 168.75 && deg <= 191.25:
                degstr = lf.south;
                break;
            case deg > 191.25 && deg <= 213.75:
                degstr = lf.south + lf.south + lf.west;
                break;
            case deg > 213.75 && deg <= 236.25:
                degstr = lf.south + lf.west;
                break;
            case deg > 236.25 && deg <= 258.75:
                degstr = lf.west + lf.south + lf.west;
                break;
            case deg > 258.75 && deg <= 281.25:
                degstr = lf.west;
                break;
            case deg > 281.25 && deg <= 303.75:
                degstr = lf.west + lf.north + lf.west;
                break;
            case deg > 303.75 && deg <= 326.25:
                degstr = lf.north + lf.west;
                break;
            case deg > 326.25 && deg <= 348.75:
                degstr = lf.north + lf.north + lf.west;
                break;
        }

        // Make visibility units nicer
        let visibility = body.visibility + " m";

        if (body.visibility > 1000) {
            visibility = bot.misc.round(body.visibility / 1000, 1) + " km";
        }

        message.channel.send({
            embeds: [{
                title: lf.weatherincity.replace("cityname", `${body.name} (${body.sys.country})`) + ":",
                color: bot.misc.randomHex(),
                thumbnail: {
                    url: "http://openweathermap.org/img/w/" + body.weather[0].icon + ".png"
                },
                fields: [
                    {
                        name: `${lf.weather}:`,
                        value: body.weather[0].description
                    },
                    {
                        name: `${lf.cloudcoverage}:`,
                        value: body.clouds.all + " %"
                    },
                    {
                        name: `${lf.temperature}:`,
                        value: `${bot.misc.round(body.main.temp - 273, 2)} °C | ${bot.misc.round(body.main.temp * 1.8 - 459.67, 2)} °F`
                    },
                    {
                        name: `${lf.visibility}:`,
                        value: visibility
                    },
                    {
                        name: `${lf.wind}:`,
                        value: `${body.wind.speed} m/s\n${degstr} (${body.wind.deg}°)`
                    }],
                footer: {
                    text: `${lang.general.poweredby} OpenWeatherMap API`
                },
                timestamp: message.createdAt
            }]
        });
    } catch (err) {
        if (err.status == 404) return message.channel.send(lf.notfound);

        logger("error", "weather.js", "API Error: " + err);
        message.channel.send(`openweathermap.org API ${lang.general.error}: ${err}`);
    }
};

module.exports.info = {
    names: ["weather"],
    description: "cmd.weather.infodescription",
    usage: "(city name)",
    options: [
        {
            name: "city-name",
            description: "Which city to get the weather of",
            required: true,
            type: Discord.ApplicationCommandOptionType.String
        },
    ],
    accessableby: ["all"],
    allowedindm: true,
    nsfwonly: false
};
