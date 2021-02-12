//This file contains code of the getuserfrommsg function and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

module.exports.run = (message, args, startindex, endindex, allowauthorreturn, stoparguments) => {
    var searchfor = ""
    if (!endindex) endindex = 99999999
    if (!stoparguments) stoparguments = []

    //construct username string to search for
    args.every((e, i) => {
        if (i < startindex) return true; //we don't need to start yet so lets skip the iteration

        if (i >= startindex && !stoparguments.includes(e) && i < endindex) { //this argument is still valid
            if (searchfor.length > 0) searchfor += ` ${e}` //if there is already something in the string add a space infront this entry
                else searchfor += e
            
            return true; //continue with next iteration
        } else return false; //stop loop
    })

    if (!searchfor && allowauthorreturn) return message.author
    else if (message.guild.members.cache.find(member => member.user.username == searchfor)) return message.guild.members.cache.find(member => member.user.username == searchfor).user
    else if (message.guild.members.cache.find(member => member.nickname == searchfor)) return message.guild.members.cache.find(member => member.nickname == searchfor).user
    else if (message.guild.members.cache.get(searchfor)) return message.guild.members.cache.get(searchfor).user
    else if (message.mentions.users.first()) return message.mentions.users.first()
    else return {} }