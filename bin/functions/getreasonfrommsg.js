/*
 * File: getreasonfrommsg.js
 * Project: beepbot
 * Created Date: 12.02.2021 19:25:00
 * Author: 3urobeat
 * 
 * Last Modified: 17.11.2021 19:29:37
 * Modified By: 3urobeat
 * 
 * Copyright (c) 2021 3urobeat <https://github.com/HerrEurobeat>
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
 */


//This file contains code of the getreasonfrommsg function and is called by bot.js
//I did this to reduce the amount of lines in bot.js to make finding stuff easier.

module.exports.run = (args, stoparguments, callback) => {
    var searchfor = ""
    let startindex = args.indexOf("-r") + 1
    if (startindex == 0) return callback(undefined, "/") //seems like no reason was provided

    args.every((e, i) => {
        if (i < startindex) return true; //we don't need to start yet so lets skip the iteration

        if (searchfor.length > 0) searchfor += ` ${e}` //if there is already something in the string add a space infront this entry
            else searchfor += e
        
        if (stoparguments.includes(args[i + 1]) || i + 1 > args.length - 1) { //check if next iteration would match a stoparg or it would exceed the array length
            callback(searchfor, searchfor)

            return false; //stop loop
        } else {
            return true; //continue with next iteration
        } 
    })
}