/*
 * File: getuserfrommsg.js
 * Project: beepbot
 * Created Date: 12.02.2021 19:25:00
 * Author: 3urobeat
 * 
 * Last Modified: 17.11.2021 19:30:22
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


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