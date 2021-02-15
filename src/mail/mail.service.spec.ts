import { CONFIG_OPTIONS } from './../common/common.constants';
import { Test } from "@nestjs/testing";
import { MailService } from "./mail.service";
import fetch from 'node-fetch';
import * as FormData from 'form-data';

jest.mock('node-fetch');
jest.mock('form-data');

describe('Mail Service', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {  apikey: 'api-key', domain: 'maildomain', fromEmail: 'from@email.com'}
        }
      ]
    }).compile();

    service = module.get<MailService>(MailService);
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', async () => {
      const sendVerificationEmailArgs = {
        email: 'test@uber-eats.com',
        code: 'code'
      };
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);
      await service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code
      );

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith("Verify yout email", "confirmationemailaddress", [{key: 'code', value: sendVerificationEmailArgs.code}, {key: 'username', value: sendVerificationEmailArgs.email}]);
    });
  });

  describe('sendEmail', () => {
    it('sends email', async () => {
      const result = await service.sendEmail('', '', []);
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      expect(formSpy).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
      expect(result).toEqual(true);
    });
  });
});