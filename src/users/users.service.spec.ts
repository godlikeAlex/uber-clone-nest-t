import { Verification } from './entities/verification.entity';
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { JwtService } from 'src/jwt/jwt.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { getRepository, Repository } from 'typeorm';

const mockRepository = () => ({
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(() => "signed-token"),
  verify: jest.fn()
};

const mockMailService = {
  sendVerificationEmail: jest.fn()
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository;
  let verificationRepository: MockRepository;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService, 
        {
          provide: getRepositoryToken(User), useValue: mockRepository()
        },
        {
          provide: getRepositoryToken(Verification), useValue: mockRepository()
        },
        {
          provide: ConfigService, useValue: {get: jest.fn()}
        },
        {
          provide: JwtService, useValue: mockJwtService
        },
        {
          provide: MailService, useValue: mockMailService
        },
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
    verificationRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined()
  });
  
  describe("createAccount", () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0
    };

    it('should fail if user exists', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@jest.com'
      });

      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({ok: false, error: 'Account already exists.'});
    });

    it('should create a new user', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.create.mockReturnValue(createAccountArgs);
      userRepository.save.mockResolvedValue(createAccountArgs);
      verificationRepository.create.mockReturnValue({user: createAccountArgs});
      verificationRepository.save.mockResolvedValue({code: "code"});
      const result = await service.createAccount(createAccountArgs);
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({user: createAccountArgs});
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String)
      );

      expect(result).toEqual({ok: true});
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Error'));

      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ok: false, error: "Couldn't create account"});
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'bs@mail.ru',
      password: 'bs.password.ru'
    };

    it('should fail if user does not exists', async() => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
      expect(result).toEqual({
        ok: false,
        error: `User with email: ${loginArgs.email} not found.`
      });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        id: 1,
        comparePassword: jest.fn(() => Promise.resolve(false))
      };
      userRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: 'Password not match.' });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        comparePassword: jest.fn(() => Promise.resolve(true))
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ok: true, token: "signed-token"})
    });
  });

  describe('findOne', () => {
    const findByIdArgs = {id: 1}
    it('should find an existing user', async () => {
      userRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findOne(findByIdArgs.id);

      expect(result).toEqual({ok: true, user: findByIdArgs})
    });

    it('should fail if no user it found', async () => {
      userRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findOne(1);

      expect(result).toEqual({ ok: false, error: 'User Not Found' });
    });
  });

  describe('editProfile', () => {
    it("should change email", async () => {
      const oldUser = {
        email: "godlike@gm.com",
        verified: true
      };
      const editProfileArgs = {
        userId: 1,
        input: {email: "yurkovksyy@gmail.com"},
      }
      const newVerefication = {
        code: "code",
      }
      const newUser = {
        verified: false,
        email: editProfileArgs.input.email
      };
      userRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.create.mockReturnValue(newVerefication);
      verificationRepository.save.mockResolvedValue(newVerefication);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(editProfileArgs.userId);

      expect(verificationRepository.create).toHaveBeenCalledWith({user: newUser});
      expect(verificationRepository.save).toHaveBeenCalledWith(newVerefication);

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(newUser.email, newVerefication.code);
    });
  });
  it.todo('verifyEmail');
});