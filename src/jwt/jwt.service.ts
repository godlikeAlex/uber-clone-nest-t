import { CONFIG_OPTIONS } from './../common/common.constants';
import * as jwt from 'jsonwebtoken';
import { JWTOptions } from './jwt.interfaces';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JWTOptions
  ) {
    console.log(process.env.NODE_ENV);
  }

  sign(userId: number): string {
    return jwt.sign({id: userId}, this.options.privateKey);
  }

  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
