import { MailOptions } from './mail.interface';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from './../common/common.constants';
import { MailService } from './mail.service';

@Module({})
@Global()
export class MailModule {
  static forRoot(mailOptions: MailOptions): DynamicModule {
    return {
      module: MailModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: mailOptions
        },
        MailService
      ],
      exports: [MailService]
    }
  }
}
