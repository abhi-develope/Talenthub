// base.dto.ts
import { plainToInstance } from 'class-transformer';

export abstract class BaseDTO {
  static transform<T>(this: new () => T, object: any): T {
    return plainToInstance(this, object, {
      excludeExtraneousValues: true,
    });
  }
}