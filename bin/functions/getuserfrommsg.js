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
        } else {
            return false; //stop loop
        }
    })

    
    if (!searchfor && allowauthorreturn) {
        return message.author //author

    } else if (message.guild.members.cache.filter(member => member.user.username == searchfor).size > 0) { //search by username
        let searchCollection = message.guild.members.cache.filter(member => member.username == searchfor)

        if (searchCollection.size > 1) {
            return searchCollection.size //return amount of users found if more than one was found
        } else {
            return [...searchCollection.values()][0].user //if only one was found return 
        }

    } else if (message.guild.members.cache.filter(member => member.nickname == searchfor).size > 0) { //search by nickname
        let searchCollection = message.guild.members.cache.filter(member => member.nickname == searchfor)

        if (searchCollection.size > 1) {
            return searchCollection.size //return amount of users found if more than one was found
        } else {
            return [...searchCollection.values()][0].user //if only one was found return 
        }

    } else if (message.guild.members.cache.get(searchfor)) {
        return message.guild.members.cache.get(searchfor).user //get by id

    } else if (message.mentions.users.first()) {
        return message.mentions.users.first() //get mention

    } else {
        return undefined //return undefined if nothing was found
    }
}