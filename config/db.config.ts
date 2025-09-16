import {
    MongooseModuleOptions,
    MongooseOptionsFactory,
  } from '@nestjs/mongoose';
  import { Injectable } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  
  @Injectable()
  export class DatabaseConfigService implements MongooseOptionsFactory {
    constructor(private configService: ConfigService) {}
  
    createMongooseOptions(): MongooseModuleOptions {
      const username = this.configService.get<string>('MONGO_USERNAME');
      const password = this.configService.get<string>('MONGO_PASSWORD');
      const host = this.configService.get<string>('MONGO_HOST');
      const port = this.configService.get<number>('MONGO_PORT');
            const database = this.configService.get<string>('MONGO_DATABASE');

      const isAtlas = host?.includes('mongodb.net') || false; // check for Atlas
  
      let mongodbConnectionUrl = '';
  
      if (isAtlas) {
        // MongoDB Atlas URL format
        mongodbConnectionUrl =
          'mongodb+srv://' +
          username +
          ':' +
          password +
          '@' +
          host +
          '/' +
          database;
      } else {
        // Regular MongoDB URL format with optional port
        mongodbConnectionUrl =
          'mongodb://' +
          username +
          ':' +
          password +
          '@' +
          host +
          (port ? ':' + port : '') + // Only append port if provided
          '/' +
          database;
      }
  
      return {
        uri: mongodbConnectionUrl,
      };
    }
  }
  