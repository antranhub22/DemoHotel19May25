// Proper logging utility for the application
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  data?: any;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.logLevel = this.getLogLevel();
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  private getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    switch (level) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      default:
        return this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any
  ): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];

    const logEntry: LogEntry = {
      timestamp,
      level: levelStr,
      message,
      context,
      data,
    };

    if (this.isDevelopment) {
      // Pretty format for development
      let formatted = `${timestamp} [${levelStr}]`;
      if (context) {
        formatted += ` [${context}]`;
      }
      formatted += ` ${message}`;
      if (data) {
        formatted += ` ${JSON.stringify(data)}`;
      }
      return formatted;
    } else {
      // JSON format for production
      return JSON.stringify(logEntry);
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any
  ): void {
    if (level < this.logLevel) {
      return;
    }

    const formatted = this.formatMessage(level, message, context, data);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  // Convenience methods with emojis for better readability
  success(message: string, context?: string, data?: any): void {
    this.info(`✅ ${message}`, context, data);
  }

  loading(message: string, context?: string, data?: any): void {
    this.info(`⏳ ${message}`, context, data);
  }

  progress(message: string, context?: string, data?: any): void {
    this.info(`🔄 ${message}`, context, data);
  }

  database(message: string, context?: string, data?: any): void {
    this.info(`🗄️ ${message}`, context, data);
  }

  api(message: string, context?: string, data?: any): void {
    this.info(`🌐 ${message}`, context, data);
  }

  email(message: string, context?: string, data?: any): void {
    this.info(`📧 ${message}`, context, data);
  }

  hotel(message: string, context?: string, data?: any): void {
    this.info(`🏨 ${message}`, context, data);
  }

  assistant(message: string, context?: string, data?: any): void {
    this.info(`🤖 ${message}`, context, data);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default for backwards compatibility
export default logger;
