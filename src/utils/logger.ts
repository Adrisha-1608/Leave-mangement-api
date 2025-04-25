import { createLogger, transports, format, info } from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure log folder exists
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf((info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
);

export const logger = createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logDir, 'combined.log') }),
  ],
});