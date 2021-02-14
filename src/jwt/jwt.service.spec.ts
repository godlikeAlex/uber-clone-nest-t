import { Test } from "@nestjs/testing";
import * as jwt from 'jsonwebtoken';
import { JwtService } from "./jwt.service";
import { CONFIG_OPTIONS } from './../common/common.constants';

const payload = {id: 1};

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'TOKEN'),
  verify: jest.fn(() => payload),
}))

const TEST_KEY = 'TEST_KEY';

describe('JwtService', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {privateKey: TEST_KEY}
        }
      ]
    }).compile();
    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined(); 
  });

  describe('sign', () => {
    it('should sign the token', () => {
      const ID = 1;
      const token = service.sign(ID);
      expect(typeof token).toBe('string');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({id: ID}, TEST_KEY);
    });
  });

  describe('verify', () => {
    it('should return the decoded token', () => {
      const result = service.verify('TOKEN');

      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith('TOKEN', TEST_KEY);

      expect(result).toBe(payload);
    });
  });
});