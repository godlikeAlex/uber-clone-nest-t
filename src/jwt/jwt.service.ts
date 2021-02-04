import * as jwt from 'jsonwebtoken';
import { JWTOptions } from './jwt.interfaces';
import { Inject, Injectable } from '@nestjs/common';
import { JWT_OPTIONS } from './jwt.constants';

@Injectable()
export class JwtService {
  constructor(
    @Inject(JWT_OPTIONS) private readonly options: JWTOptions
  ) {}

  sign(userId: number): string {
    return jwt.sign({id: userId}, this.options.privateKey);
  }

  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
