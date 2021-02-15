import { CONFIG_OPTIONS } from './../common/common.constants';
import { Test } from "@nestjs/testing";
import { MailService } from "./mail.service";

jest.mock('node-fetch', () => {});
jest.mock('url', () => ({
  URLSearchParams: jest
}));

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
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {});
      await service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code
      );

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith("Verify yout email", "confirmationemailaddress", [{key: 'code', value: sendVerificationEmailArgs.code}, {key: 'username', value: sendVerificationEmailArgs.email}]);
    });
  });
});