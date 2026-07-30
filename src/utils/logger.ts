export class Logger {
  private static formatTime(): string {
    return new Date().toISOString();
  }

  static info(message: string, ...args: unknown[]): void {
    console.log(`[INFO] [${this.formatTime()}] ${message}`, ...args);
  }

  static warn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] [${this.formatTime()}] ${message}`, ...args);
  }

  static error(message: string, ...args: unknown[]): void {
    console.error(`[ERROR] [${this.formatTime()}] ${message}`, ...args);
  }

  static debug(message: string, ...args: unknown[]): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] [${this.formatTime()}] ${message}`, ...args);
    }
  }
}
