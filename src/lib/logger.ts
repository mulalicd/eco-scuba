// src/lib/logger.ts
// Simple structured logger utility
// In production, replace with a proper logging service like Sentry or Winston

type LogLevel = 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    }

    // In development, log to console
    if (import.meta.env.DEV) {
      console[level](`[${timestamp}] ${level.toUpperCase()}: ${message}`, context || '')
    }

    // In production, send to logging service
    // TODO: Integrate with Sentry, LogRocket, etc.
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context)
  }
}

export const logger = new Logger()