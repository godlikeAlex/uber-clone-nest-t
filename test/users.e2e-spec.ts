import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';

const GRAPHQL_ENDPOINT = '/graphql';
const testUser = {
  email: 'godlikedesigner@gmail.com',
  password: '5261438s'
}
// jest.mock('node-fetch');

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let verificationRepository: Repository<Verification>;
  let token: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationRepository = module.get<Repository<Verification>>(getRepositoryToken(Verification));
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  
  describe('createAccount', () => {

    it('should create account', async () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT)
      .send({
        query: `mutation {
          createAccount(input: {
            email: "${testUser.email}",
            password: "${testUser.password}",
            role: Client
          }) {error  ok  }
            }`
          })
          .expect(200)
          .expect(res => {
            const {data: {createAccount}} = res.body;
            
          expect(createAccount.ok).toBe(true);
          expect(createAccount.error).toBe(null);
        })
      });
      
      it('it should fail if account allready exists', async () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT)
      .send({
          query: `mutation {
            createAccount(input: {
              email: "${testUser.email}",
              password: "${testUser.password}",
              role: Client
            }) {error  ok  }
            }`
          })
          .expect(200)
          .expect(res => {
            const {data: {createAccount}} = res.body;

            expect(createAccount.ok).toBe(false);
            expect(createAccount.error).toEqual(expect.any(String));
          })
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutation {
          login(input:{email:"${testUser.email}", password: "${testUser.password}"}) {
            error,
            ok,
            token
          }
        }
        `
      })
      .expect(200)
      .expect(res => {
        const {data: {login}} = res.body;
        expect(login.ok).toBe(true);
        expect(login.error).toBe(null);
        expect(login.token).toEqual(expect.any(String));
        token = login.token;
      })
    });
    
    it('should not be able to login with wrong credentials', async () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
          mutation {
            login(input:{email:"${testUser.email}", password: "xyxyxyxy"}) {
              error,
              ok,
              token
            }
          }
          `
        })
        .expect(200)
        .expect(res => {
          const {data: {login}} = res.body;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('Password not match.');
          expect(login.token).toBe(null);
        })
      });
    });
    describe('userProfile', () => {
      let userId: number;
      beforeAll(async () => {
        const [user] = await usersRepository.find();
        userId = user.id
      });

      it("should see a user profile" , () => {
        return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', token)
        .send({
          query: `
          {
            userProfile(userId: ${userId}) {
              error,
              ok,
              user {
                id
                email
              }
            }
          }`
        })
          .expect(200)
          .expect(res => {
            const {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: {id}
                }
              }
            } = res.body;
            expect(ok).toBe(true);
            expect(error).toBe(null);
            expect(id).toEqual(userId);
          })
      });
      it("should not a find user", () => {
        return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', token)
        .send({
          query: `
          {
            userProfile(userId: 666) {
              error,
              ok,
              user {
                id
                email
              }
            }
          }`
        })
          .expect(200)
          .expect(res => {
            const {
              data: {
                userProfile: {
                  ok,
                  error,
                  user
                }
              }
            } = res.body;
            expect(ok).toBe(false);
            expect(error).toBe('User Not Found');
            expect(user).toBe(null);
          })
      })
    });
    
    describe('me', () => {
      it('should find my profile', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', token)
          .send({
            query: `
              {
                me {
                  email
                }
              }
            `
          })
          .expect(200)
          .expect(res => {
            const {data: {me: {email}}} = res.body;
            expect(email).toBe(testUser.email);
          })
      })
      
      it('should not allow logged out user', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .send({
            query: `
              {
                me {
                  email
                }
              }
            `
          })
          .expect(200)
          .expect(res => {
            const {errors} = res.body;
            const [error] = errors;
            expect(error.message).toBe('Forbidden resource');
          })
      });
    })

    describe('editProfile', () => {
      const NEW_EMAIL = 'new@gmail.com';
      it("should change email", () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', token)
          .send({
            query: `
            mutation{
              editProfile(input:{email:"${NEW_EMAIL}"}) {
                ok,
                error
              }
            }
            `
          })
          .expect(200)
          .expect(res => {
            const {data: {editProfile: {ok, error}}} = res.body;
            expect(ok).toBe(true);
            expect(error).toBe(null);
          })
      })

      it('should have new email', () => {
        return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', token)
        .send({
          query: `
            {
              me {
                email
              }
            }
          `
        })
        .expect(200)
        .expect(res => {
          const {data: {me: {email}}} = res.body;
          expect(email).toBe(NEW_EMAIL);
        })
      })
    });
    
    describe('verifyEmail', () => {
      let verificationCode: string;
      beforeAll(async () => {
        const [verification] = await verificationRepository.find();
        verificationCode = verification.code;
      });

      it("should verify email", () => {
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query: `mutation {
            verifyEmail(input:{code: "${verificationCode}"}) {
              error,
              ok
            } 
          }
          `
        }).expect(res => {
          const {data: {verifyEmail: {ok, error}}} = res.body;

          expect(ok).toBe(true);
          expect(error).toBe(null);
        })
      });

      it("should fail on wrong verification code", () => {
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query: `mutation {
            verifyEmail(input:{code: "xxxxxxx"}) {
              error,
              ok
            }
          }
          `
        }).expect(200).expect(res => {
          const {data: {verifyEmail: {ok, error}}} = res.body;
          expect(ok).toBe(false);
          expect(error).toBe('Verification not found.');
        })
      });
    });
  });
  