/*
 * File: getUserFromMsg.js
 * Project: beepbot
 * Created Date: 2021-02-12 19:25:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-13 13:11:29
 * Modified By: 3urobeat
 *
 * Copyright (c) 2021 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


const Discord = require("discord.js"); // eslint-disable-line

const Bot = require("../bot.js");


/**
 * The getUserFromMsg helper function
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {number} startindex The index where to start searching in the args array
 * @param {number} endindex The index where to stop searching in the args array
 * @param {boolean} allowauthorreturn Defines if the author of the message is allowed to be returned as the user to search for
 * @param {Array} stoparguments An array of arguments that will stop the loop if found at the current position
 * @returns {Discord.User | number | undefined} Returns the user if found, number of matching users if multiple found or undefined if no user was found
 */
Bot.prototype.getUserFromMsg = function(message, args, startindex, endindex, allowauthorreturn, stoparguments) {
    let searchfor = "";
    if (!endindex) endindex = 99999999;
    if (!stoparguments) stoparguments = [];

    // Construct username string to search for
    args.every((e, i) => {
        if (i < startindex) return true; // We don't need to start yet so lets skip the iteration

        if (i >= startindex && !stoparguments.includes(e) && i < endindex) { // This argument is still valid
            if (searchfor.length > 0) searchfor += ` ${e}`; // If there is already something in the string add a space infront this entry
                else searchfor += e;

            return true; // Continue with next iteration
        } else {
            return false; // Stop loop
        }
    });

    logger("debug", "getUserFromMsg.js", `Searching for: ${searchfor} | allowauthorreturn: ${allowauthorreturn}`);


    if (!searchfor && allowauthorreturn) {
        return message.author; // Author

    } else if (message.guild.members.cache.filter(member => member.user.username == searchfor).size > 0) { // Search by username
        let searchCollection = message.guild.members.cache.filter(member => member.user.username == searchfor);

        if (searchCollection.size > 1) {
            return searchCollection.size; // Return amount of users found if more than one was found
        } else {
            return [...searchCollection.values()][0].user; // If only one was found return
        }

    } else if (message.guild.members.cache.filter(member => member.user.displayName == searchfor).size > 0) { // Search by displayName
        let searchCollection = message.guild.members.cache.filter(member => member.user.displayName == searchfor);

        if (searchCollection.size > 1) {
            return searchCollection.size; // Return amount of users found if more than one was found
        } else {
            return [...searchCollection.values()][0].user; // If only one was found return
        }

    } else if (message.guild.members.cache.filter(member => member.nickname == searchfor).size > 0) { // Search by nickname
        let searchCollection = message.guild.members.cache.filter(member => member.nickname == searchfor);

        if (searchCollection.size > 1) {
            return searchCollection.size; // Return amount of users found if more than one was found
        } else {
            return [...searchCollection.values()][0].user; // If only one was found return
        }

    } else if (message.guild.members.cache.get(searchfor)) {
        return message.guild.members.cache.get(searchfor).user; // Get by id

    } else if (message.mentions.users.first()) {
        return message.mentions.users.first(); // Get mention

    } else {
        return undefined; // Return undefined if nothing was found
    }
};
