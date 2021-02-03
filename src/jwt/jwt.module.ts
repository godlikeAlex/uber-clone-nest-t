import { DynamicModule, Global, Module } from '@nestjs/common';
import { JWT_OPTIONS } from './jwt.constants';
import { JWTOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JWTOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        {
          provide: JWT_OPTIONS,
          useValue: options
        },
        JwtService
      ],
      exports: [JwtService],
    }
  }
}
