import fs from 'fs';
import path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

// Migrate away from old log
const OLD_LOG_FILE = path.join(__dirname, '../config/logs/Jellyseerr.log');
if (fs.existsSync(OLD_LOG_FILE)) {
  const file = fs.lstatSync(OLD_LOG_FILE);

  if (!file.isSymbolicLink()) {
    fs.unlinkSync(OLD_LOG_FILE);
  }
}

const hformat = winston.format.printf(
  ({ level, label, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]${
      label ? `[${label}]` : ''
    }: ${message} `;
    if (Object.keys(metadata).length > 0) {
      msg += JSON.stringify(metadata);
    }
    return msg;
  }
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.timestamp(),
    hformat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.timestamp(),
        hformat
      ),
    }),
    new winston.transports.DailyRotateFile({
      filename: process.env.CONFIG_DIRECTORY
        ? `${process.env.CONFIG_DIRECTORY}/logs/Jellyseerr-%DATE%.log`
        : path.join(__dirname, '../config/logs/Jellyseerr-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
      createSymlink: true,
      symlinkName: 'Jellyseerr.log',
    }),
  ],
});

export default logger;
