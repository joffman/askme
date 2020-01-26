const appRoot = require("app-root-path");
const winston = require("winston");

/*
 * Winston configuration.
 * See: https://www.digitalocean.com/community/tutorials/how-to-use-winston-to-log-node-js-applications
 */

// Create custom formats.
const consoleFormat = winston.format.printf(function(info) {
    return `${info.timestamp} - ${info.label} - ${info.level}: ${info.message}`;
});

// Options for each transport.
var options = {
    file: {
        level: "info",
        filename: `${appRoot}/logs/askme.log.json`,
        handleExceptions: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: winston.format.combine(
            winston.format.splat(),
            winston.format.label({ label: "askme" }),
            winston.format.timestamp(),
            winston.format.json()
        )
    },
    console: {
        level: "debug",
        handleExceptions: true,
        format: winston.format.combine(
            winston.format.splat(),
            winston.format.label({ label: "askme" }),
            winston.format.timestamp(),
            winston.format.colorize(),
            consoleFormat
        )
    }
};

// Create logger.
const logger = winston.createLogger({
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false
});

// Create stream object that is used by morgan.
logger.stream = {
    write: function(message, encoding) {
        logger.info(message.replace(/\n$/, ""));
    }
};

module.exports = logger;
