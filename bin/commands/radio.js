module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const i = require("../index.js")

    if (message.channel.type == "dm") {
        message.channel.send("You have to execute this command on a server!")
        return; }
    if (v.os.platform == "linux") {
        message.channel.send("The music feature is due to extreme lags disabled when running on my Raspberry Pi. :confused:")
        return; }
    if (!message.member.voiceChannel) {
        message.channel.send("Please join a voice channel first.");
        return; }
    if (message.guild.voiceConnection && message.member.voiceChannel) if (message.member.voiceChannel.id != message.guild.voiceConnection.channel.id) {
        message.channel.send("The bot is not in your voice channel!") 
        return; }
    if (message.member.voiceChannel.full) {
        message.channel.send("Your voice channel is full!");
        return; }
    if (!message.member.voiceChannel.joinable) {
        message.channel.send("Missing permission to join your voice channel!");
        return; }
    if (!message.member.voiceChannel.speakable) {
        message.channel.send("Halp! I can't speak!");
        return; }   

    if (args[0] === undefined) {
        message.channel.send("Please provide a valid station name. Get all supported stations with *radio stations.")
        return;
    } else {
        var protocol = 'http'
        switch(args.slice(0).join(" ").toLowerCase()) {
            case "stations":
                message.channel.send("Supported radio stations:\n   dlf (Deutschlandfunk)\n   next (Bremen NEXT)\n   njoy (N-JOY)\n   ndrinfo (NDR Info)\n   radio21 (Radio 21)\n   ndr2 (NDR 2)\n   ndr1 (NDR 1)")
                return;
            case "dlf":
                var station = "http://dg-dradio-http-fra-dtag-cdn.cast.addradio.de/dlf/01/128/mp3/stream.mp3"
                var stationname = "Deutschlandfunk"
                break;
            case "next":
                var station = "http://dg-rb-http-dus-dtag-cdn.cast.addradio.de/rb/bremennext/live/mp3/128/stream.mp3"
                var stationname = "Bremen NEXT"
                break;
            case "njoy":
                var station = "http://dg-ndr-http-dus-dtag-cdn.cast.addradio.de/ndr/njoy/live/mp3/128/stream.mp3"
                var stationname = "N-JOY"
                break;
            case "ndrinfo":
                var station = "http://dg-ndr-http-dus-dtag-cdn.cast.addradio.de/ndr/ndrinfo/niedersachsen/mp3/128/stream.mp3"
                var stationname = "NDR Info"
                break;
            case "radio21":
                var station = "http://188.94.97.91/radio21.mp3"
                var stationname = "Radio 21"
                break;
            case "ndr2":
                var station = "http://dg-ndr-http-dus-dtag-cdn.cast.addradio.de/ndr/ndr2/niedersachsen/mp3/128/stream.mp3"
                var stationname = "NDR 2"
                break;
            case "ndr1":
                var station = "http://dg-ndr-http-fra-dtag-cdn.cast.addradio.de/ndr/ndr1niedersachsen/oldenburg/mp3/128/stream.mp3"
                var stationname = "NDR 1 Niedersachsen"
                break;

            case "autismus":
                var station = "https://cdn.discordapp.com/attachments/508006321229004811/508016151641718804/5_Sekunden_Autismus.mp3"
                var stationname = "5 Sekunden Autismus"
                var protocol = 'https'
                break;

            default:
                message.channel.send("Please provide a valid station name. Get all supported stations with *radio stations.")
                return;
        }
    }

    message.member.voiceChannel.join().then(connection => {
        require(protocol).get(station, (res) => {
            connection.playStream(res);
        });
        message.channel.send("Playing " + stationname + "...")
    }).catch(err => "<:tick:445752370324832256> **Error:** ```\n" + err + "```");

}

module.exports.config = {
    command: "radio"
}