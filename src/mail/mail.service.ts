import * as FormData from 'form-data'; // May-be doesn't work, need import url.
import fetch from 'node-fetch';
import { EmailVar, MailOptions } from './mail.interface';
import { CONFIG_OPTIONS } from './../common/common.constants';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailOptions
  ) {}

  async sendEmail(subject: string, templateName: string, emailVars: EmailVar[]): Promise<Boolean> {
    const form = new FormData();
    form.append('from', `Alexander from uber eats <mailgun@${this.options.domain}>`);
    form.append('to', `godlikedesigner@gmail.com`);
    form.append('v:username', "Aleksandr");
    form.append('subject', subject);
    form.append('template', templateName);
    emailVars.forEach(({key, value}) => form.append(`v:${key}`, value));

    try {
      await fetch(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${this.options.apikey}`).toString('base64')}`
        },
        body: form
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail("Verify yout email", "confirmationemailaddress", [{key: 'code', value: code}, {key: 'username', value: email}])
  }
}
