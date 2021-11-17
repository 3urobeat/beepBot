//This file contains code of the gettimefrommsg function and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

module.exports.run = (args, callback) => { //eslint-disable-line
    var arr = []
    
    if (args.includes("-t")) {
        arr = [args[args.indexOf("-t") + 1], args[args.indexOf("-t") + 2]] //Result example: ["2", "minutes"]
    } else if (args.includes("-time")) {
        arr = [args[args.indexOf("-time") + 1], args[args.indexOf("-time") + 2]] //Result example: ["2", "minutes"]
    } else {
        callback(null, null, []) //nothing found
    }

    switch (arr[1]) {
        case "second":
        case "seconds":
            callback(arr[0] * 1000, 0, arr)
            break;
        case "minute":
        case "minutes":
            callback(arr[0] * 60000, 1, arr)
            break;
        case "hour":
        case "hours":
            callback(arr[0] * 3600000, 2, arr)
            break;
        case "day":
        case "days":
            callback(arr[0] * 86400000, 3, arr)
            break;
        case "month":
        case "months":
            callback(arr[0] * 2629800000, 4, arr)
            break;
        case "year":
        case "years":
            callback(arr[0] * 31557600000, 5, arr)
            break;
        default:
            callback(null, null, arr)
    }
}