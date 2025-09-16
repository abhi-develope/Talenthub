import { Controller, Get } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Controller()
export class AppController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  

  @Get('health')
  async getHealth() {
    const dbStatus = this.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        readyState: this.connection.readyState,
        name: this.connection.name,
        host: this.connection.host,
        port: this.connection.port,
      },
      uptime: process.uptime(),
    };
  }

  @Get('health/db')
  async getDatabaseHealth() {
    try {
      // Test database connection by running a simple command
      if (!this.connection.db) {
        throw new Error('Database connection not established');
      }
      await this.connection.db.admin().ping();
      
      return {
        status: 'connected',
        message: 'Database is responding',
        timestamp: new Date().toISOString(),
        details: {
          name: this.connection.name,
          host: this.connection.host,
          port: this.connection.port,
          readyState: this.connection.readyState,
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database connection failed',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
