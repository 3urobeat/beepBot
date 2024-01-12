/*
 * File: bot.js
 * Project: beepbot
 * Created Date: 2020-10-04 18:10:00
 * Author: 3urobeat
 *
 * Last Modified: 2024-01-11 18:50:35
 * Modified By: 3urobeat
 *
 * Copyright (c) 2020 - 2024 3urobeat <https://github.com/3urobeat>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// A Bot instance controls one shard

const Discord = require("discord.js");
const logger  = require("output-logger");

const DataManager = require("./dataManager.js");

const { _handleErrors } = require("./helpers/handleErrors.js");


/**
 * Constructor - One bot instance controls one shard
 */
const Bot = function() {

    // Attach error handler
    _handleErrors();

    // I hate intents
    this.client = new Discord.Client({
        intents: [
            Discord.GatewayIntentBits.Guilds,
            Discord.GatewayIntentBits.GuildMembers,
            Discord.GatewayIntentBits.GuildModeration,
            Discord.GatewayIntentBits.GuildInvites,
            Discord.GatewayIntentBits.GuildPresences,
            Discord.GatewayIntentBits.GuildMessages,
            Discord.GatewayIntentBits.GuildMessageReactions,
            Discord.GatewayIntentBits.GuildVoiceStates,
            Discord.GatewayIntentBits.DirectMessages,
            Discord.GatewayIntentBits.DirectMessageReactions,
            Discord.GatewayIntentBits.MessageContent
        ],
        partials: [Discord.Partials.Message, Discord.Partials.Reaction] // Partials are messages that are not fully cached and have to be fetched manually
    });


    // Stores various values
    this.info = {
        commandcount: 0
    };


    // TODO: Remove and somehow inherit from controller
    /**
     * @type {DataManager}
     */
    this.data = new DataManager();

    this.client.data = this.data; // Quick hack to later access DataManager from broadcastEval and other discord.js internal methods


    /**
     * Collection of miscellaneous functions for easier access
     */
    this.misc = require("./functions/misc.js");


    // Load Bot's helper files
    require("./events/guildCreate.js");
    require("./events/guildDelete.js");
    require("./events/guildMemberAdd.js");
    require("./events/guildMemberRemove.js");
    require("./events/interactionCreate.js");
    require("./events/message.js");
    require("./events/messageReactionAdd.js");
    require("./events/ready.js");
    require("./events/voiceStateUpdate.js");
    require("./functions/getUserFromMsg.js");
    require("./helpers/registerSlashCommands.js");


    // Attach event handlers
    this._attachDiscordGuildCreateEvent();
    this._attachDiscordGuildDeleteEvent();
    this._attachDiscordGuildMemberAddEvent();
    this._attachDiscordGuildMemberRemoveEvent();
    this._attachDiscordInteractionCreateEvent();
    this._attachDiscordMessageEvent();
    this._attachDiscordMessageReactionAddEvent();
    this._attachDiscordReadyEvent();
    this._attachDiscordVoiceStateUpdateEvent();

};

module.exports = Bot;


/**
 * Logs in shard
 */
Bot.prototype.login = async function() {

    // Configure my logging library (https://github.com/3urobeat/output-logger#options-1)
    logger.options({
        required_from_childprocess: true, // eslint-disable-line camelcase
        msgstructure: `[${logger.Const.ANIMATION}] [${logger.Const.TYPE} | ${logger.Const.ORIGIN}] [${logger.Const.DATE}] ${logger.Const.MESSAGE}`,
        paramstructure: [logger.Const.TYPE, logger.Const.ORIGIN, logger.Const.MESSAGE, "nodate", "remove", logger.Const.ANIMATION],
        outputfile: "./output.txt",
        animationdelay: 250,
        printdebug: this.data.config.printDebug
    });

    global.logger = logger;


    /* -------------- Import data -------------- */
    await this.data.loadData(); // TODO: Remove and somehow inherit from controller


    // Login shard, token is provided by ShardingManager
    logger("info", "bot.js", "Logging in...", false, true);

    this.client.login();

};


/* -------------- Entry point -------------- */
let bot = new Bot();

bot.login();



/* -------- Register functions to let the IntelliSense know what's going on in helper files -------- */

/**
 * Handles discord.js's guildCreate event of this shard
 */
Bot.prototype._attachDiscordGuildCreateEvent = function() {};

/**
 * Handles discord.js's guildDelete event of this shard
 */
Bot.prototype._attachDiscordGuildDeleteEvent = function() {};

/**
 * Handles discord.js's guildMemberAdd event of this shard
 */
Bot.prototype._attachDiscordGuildMemberAddEvent = function() {};

/**
 * Handles discord.js's guildMemberRemove event of this shard
 */
Bot.prototype._attachDiscordGuildMemberRemoveEvent = function() {};

/**
 * Handles discord.js's interactionCreate event of this shard
 */
Bot.prototype._attachDiscordInteractionCreateEvent = function() {};

/**
 * Handles discord.js's message (renamed to messageCreate) event of this shard
 */
Bot.prototype._attachDiscordMessageEvent = function() {};

/**
 * Handles discord.js's messageReactionAdd event of this shard
 */
Bot.prototype._attachDiscordMessageReactionAddEvent = function() {};

/**
 * Handles discord.js's ready event of this shard
 */
Bot.prototype._attachDiscordReadyEvent = function() {};

/**
 * Handles discord.js's voiceStateUpdate event of this shard
 */
Bot.prototype._attachDiscordVoiceStateUpdateEvent = function() {};

/**
 * The getuserfrommsg helper function
 * @param {Discord.Message} message The received message object
 * @param {Array} args An array of arguments the user provided
 * @param {number} startindex The index where to start searching in the args array
 * @param {number} endindex The index where to stop searching in the args array
 * @param {boolean} allowauthorreturn Defines if the author of the message is allowed to be returned as the user to search for
 * @param {Array} stoparguments An array of arguments that will stop the loop if found at the current position
 */
Bot.prototype.getUserFromMsg = function(message, args, startindex, endindex, allowauthorreturn, stoparguments) {}; // eslint-disable-line

/**
 * Registers slash commands
 */
Bot.prototype.registerSlashCommands = function() {};
