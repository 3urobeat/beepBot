module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const i = require("../index.js")

    var temp = v.fs.readFileSync("/sys/class/thermal/thermal_zone0/temp") / 1000;
    message.channel.send("CPU Temperature: " + temp)

}

module.exports.config = {
    command: "test"
}