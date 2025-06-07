import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

class Logger {
  private logFilePath: string;
  private maxFileSize: number = 5 * 1024 * 1024; // 5MB
  private maxLogFiles: number = 5;

  constructor() {
    // Log dosyasının yolunu platform'a göre belirle
    const baseDir = Platform.select({
      ios: RNFS.DocumentDirectoryPath,
      android: RNFS.ExternalDirectoryPath,
    });
    
    this.logFilePath = `${baseDir}/app_logs.txt`;
    this.initializeLogger();
  }

  private async initializeLogger() {
    try {
      // Log dosyası yoksa oluştur
      const exists = await RNFS.exists(this.logFilePath);
      if (!exists) {
        await RNFS.writeFile(this.logFilePath, '', 'utf8');
      }

      // Dosya boyutu kontrolü
      await this.checkFileSize();
    } catch (error) {
      console.error('Logger initialization failed:', error);
    }
  }

  private async checkFileSize() {
    try {
      const stats = await RNFS.stat(this.logFilePath);
      if (stats.size > this.maxFileSize) {
        await this.rotateLogFiles();
      }
    } catch (error) {
      console.error('File size check failed:', error);
    }
  }

  private async rotateLogFiles() {
    try {
      // Eski log dosyalarını kaydır
      for (let i = this.maxLogFiles - 1; i > 0; i--) {
        const oldPath = `${this.logFilePath}.${i}`;
        const newPath = `${this.logFilePath}.${i + 1}`;
        
        if (await RNFS.exists(oldPath)) {
          await RNFS.moveFile(oldPath, newPath);
        }
      }

      // Mevcut log dosyasını .1 olarak kaydet
      await RNFS.moveFile(this.logFilePath, `${this.logFilePath}.1`);
      
      // Yeni log dosyası oluştur
      await RNFS.writeFile(this.logFilePath, '', 'utf8');
    } catch (error) {
      console.error('Log rotation failed:', error);
    }
  }

  private formatLogMessage(level: string, message: string, details?: any): string {
    const timestamp = new Date().toISOString();
    const detailsStr = details ? `\nDetails: ${JSON.stringify(details, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${message}${detailsStr}\n`;
  }

  public async log(level: string, message: string, details?: any) {
    try {
      const logMessage = this.formatLogMessage(level, message, details);
      await RNFS.appendFile(this.logFilePath, logMessage, 'utf8');
    } catch (error) {
      console.error('Logging failed:', error);
    }
  }

  public async info(message: string, details?: any) {
    await this.log('INFO', message, details);
  }

  public async error(message: string, error?: any) {
    await this.log('ERROR', message, {
      error: error?.message || error,
      stack: error?.stack,
    });
  }

  public async warn(message: string, details?: any) {
    await this.log('WARN', message, details);
  }

  public async debug(message: string, details?: any) {
    if (__DEV__) {
      await this.log('DEBUG', message, details);
    }
  }

  public async getLogContent(): Promise<string> {
    try {
      return await RNFS.readFile(this.logFilePath, 'utf8');
    } catch (error) {
      console.error('Reading log file failed:', error);
      return '';
    }
  }

  public async clearLogs() {
    try {
      await RNFS.writeFile(this.logFilePath, '', 'utf8');
    } catch (error) {
      console.error('Clearing logs failed:', error);
    }
  }

  public getLogPath(): string {
    return this.logFilePath;
  }
}

// Singleton instance
export const logger = new Logger(); 