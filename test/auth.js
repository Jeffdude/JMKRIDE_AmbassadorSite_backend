const { expect } = require('chai');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const sinon = require('sinon');
// https://github.com/underscopeio/sinon-mongoose/issues/58
require('../src/external/sinon-mongoose');
require('sinon-promise');
const assert = require('@sinonjs/referee').assert

const mongoose = require('../src/modules/mongoose.js');

const test_db = require('./db.js');
const UserModel = require('../src/users/model.js');
const sessionModel = require('../src/auth/model.js');

const debug = false;

let server, sandbox, agent;

describe('# Auth Endpoint Tests', function () {

  before((done) => {
    mongoose.connectWithRetry(debug);
    done();
  });
  beforeEach((done) => {
    sandbox = sinon.createSandbox();
    server = require('../src/index.js')(debug);
    agent = chai.request(server).keepOpen();
    done();
  });

  afterEach((done) => {
    agent.close();
    sandbox.restore();
    test_db.clearDB(done);
  });

  after((done) => {
    require('../src/modules/mongoose.js').connection.close(() => {
      if(debug) {
        console.log("[+] MongoDB connection successfully destroyed.")
      }
      done()
  });
  });
  describe('### POST /auth', () => {
    it('should not auth without creds', (done) => {
      agent
        .post('/api/v1/auth')
        .send({})
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors).to.exist;
        })
        .then(done)
        .catch(done)
    })
    it('should not auth with both invalid creds', (done) => {
      agent
        .post('/api/v1/auth')
        .send({"email": "nope@no.com", "password": "nuh_uh"})
        .then((res) => {
          expect(res).to.have.status(403);
        })
        .then(done)
        .catch(done)
    });
    it('should not auth with invalid password', (done) => {
      let UserModelMock = sandbox.stub(
        UserModel, 'findByEmail',
      ).resolves([{_id: "mockid", email: "valid@atest.com", password: "invalid"}])

      agent
        .post('/api/v1/auth')
        .send({"email": "valid@test.com", "password": "nuh_uh"})
        .then((res) => {
          expect(res).to.have.status(403);
          expect(res.body.errors).to.exist;
        })
        .then(done)
        .catch(done)
    });
    it('should succeed with valid email and password', (done) => {
      let UserModelMock = sandbox.stub(
        UserModel, 'findByEmail',
      ).resolves([
        {
          _id: "mockid",
          email: "valid@atest.com",
          password: "1$UiK/RqvSF8+Ou0JhM82eXkZLwgTVdoZg/xm+HEgvrSUX0Ue/N7rKrj8u5hf0XXsAJeHVSpn7bUi5/aLuBdaNkA=="
        }
      ])

      let sessionModelCreateMock = sandbox.stub(
        sessionModel, 'createSession'
      ).resolves(true)


      agent
        .post('/api/v1/auth')
        .send({"email": "valid@test.com", "password": "valid"})
        .then((res) => {
          expect(res).to.have.status(201);
          expect(res.body.accessToken).to.exist;
          expect(res.body.refreshToken).to.exist;
          expect(res.body.expiresIn).to.exist;
          assert(UserModelMock.called); 
          assert(sessionModelCreateMock.called); 
        })
        .then(done)
        .catch(done)
    });
  });
  describe('### POST /auth/refresh', () => {
    it('should fail with no auth', (done) => {
      agent
        .post('/api/v1/auth/refresh')
        .then((res) => {
          expect(res).to.have.status(401)
        })
        .then(done)
        .catch(done)
    });
    it('should succeed with valid auth', (done) => {
      let UserModelMock = sandbox.stub(
        UserModel, 'findByEmail',
      ).resolves([
        {
          _id: "mockid",
          email: "valid@atest.com",
          password: "1$UiK/RqvSF8+Ou0JhM82eXkZLwgTVdoZg/xm+HEgvrSUX0Ue/N7rKrj8u5hf0XXsAJeHVSpn7bUi5/aLuBdaNkA=="
        }
      ])

      let sessionModelCreateMock = sandbox.stub(
        sessionModel, 'createSession'
      ).resolves(true)

      let sessionModelValidMock = sandbox.stub(
        sessionModel, 'validSession'
      ).resolves(true)
 
      let accessToken, refreshToken;

      agent
        .post('/api/v1/auth')
        .send({"email": "valid@test.com", "password": "valid"})
        .then((res) => {
          expect(res).to.have.status(201);
          expect(res.body.accessToken).to.exist;
          accessToken = res.body.accessToken;
          expect(res.body.refreshToken).to.exist;
          refreshToken = res.body.refreshToken;
          expect(res.body.expiresIn).to.exist;
          assert(UserModelMock.called); 
          assert(sessionModelCreateMock.called); 
        })
        .then(() => {
          UserModelMock.resetHistory();
          agent
            .post('/api/v1/auth/refresh')
            .set('Authorization', 'Bearer ' + accessToken)
            .send({"refresh_token": refreshToken})
            .then((res) => {
              expect(res).to.have.status(201);
              expect(res.body.accessToken).to.exist;
              accessToken = res.body.accessToken;
              expect(res.body.refreshToken).to.exist;
              refreshToken = res.body.refreshToken;
              expect(res.body.expiresIn).to.exist;
              assert(sessionModelValidMock.called)
            })
            .then(done)
            .catch(done)
        })
        .catch(done)
    });
  });
  describe('### GET /auth/sessions/self', () => {
    it('should fail with invalid auth', (done) => {
      agent
        .get('/api/v1/auth/sessions/self')
        .set(
          'Authorization',
          'Bearer ' +
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZmM3ZWU4MjEyN2ZiNGYzNmQwNjAxMDkiLCJlbWFpbCI6InZhbGlkQHRlc3QuY29tIiwicGVybWlzc2lvbkxldmVsIjoidXNlciIsInByb3ZpZGVyIjoiZW1haWwiLCJuYW1lIjoidW5kZWZpbmVkIHVuZGVmaW5lZCIsInJlZnJlc2hLZXkiOiJMMkk2dmgzZGtkWXRSRllXMmZJMHZRPT0iLCJzZXNzaW9uSWQiOiI1ZmM3ZWU4MjEyN2ZiNGYzNmQwNjAxMGEiLCJpYXQiOjE2MDY5MzgyNDIsImV4cCI6MTYwNzExMTA0Mn0.CKnWEDpE59QBLEtJ404NiEax3sgqKM97-l0ojlCX1JE'
        )
        .then((res) => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        })
        .then(done)
        .catch(done)
    });
    it('should succeed with valid auth', (done) => {
      let accessToken;

      agent
        .post('/api/v1/users/create')
        .send({"email": "valid@test.com", "password": "valid"})
        .then((res) => {
          expect(res).to.have.status(201);
        })
        .then(() => {
          agent
            .post('/api/v1/auth')
            .send({"email": "valid@test.com", "password": "valid"})
            .then((res) => {
              expect(res).to.have.status(201);
              expect(res.body.accessToken).to.exist;
              accessToken = res.body.accessToken;
              expect(res.body.refreshToken).to.exist;
              expect(res.body.expiresIn).to.exist;
            })
            .then(() => {
              agent
                .get('/api/v1/auth/sessions/self')
                .set('Authorization', 'Bearer ' + accessToken)
                .then((res) => {
                  expect(res).to.have.status(200);
                  expect(res.body.length).to.equal(1);
                  expect(res.body[0].lastUsedDate).to.exist;
                  expect(res.body[0].lastUsedIP).to.exist;
                  assert(res.body[0].current);
                  expect(res.body[0].id).to.exist;
                })
                .then(done)
                .catch(done)
            })
            .catch(err => done(err))
        })
        .catch(err => done(err))
    });
    it('should return multiple sessions with valid auth', (done) => {
      let accessToken;

      agent
        .post('/api/v1/users/create')
        .send({"email": "valid@test.com", "password": "valid"})
        .then((res) => {
          expect(res).to.have.status(201);
        })
        .then(() => {
          agent
            .post('/api/v1/auth')
            .send({"email": "valid@test.com", "password": "valid"})
            .then((res) => {
              expect(res).to.have.status(201);
              expect(res.body.accessToken).to.exist;
              expect(res.body.refreshToken).to.exist;
              expect(res.body.expiresIn).to.exist;
            })
            .then(() => {
              agent
                .post('/api/v1/auth')
                .send({"email": "valid@test.com", "password": "valid"})
                .then((res) => {
                  expect(res).to.have.status(201);
                  expect(res.body.accessToken).to.exist;
                  accessToken = res.body.accessToken;
                  expect(res.body.refreshToken).to.exist;
                  expect(res.body.expiresIn).to.exist;
                })
                .then(() => {
                  agent
                    .get('/api/v1/auth/sessions/self')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .then((res) => {
                      expect(res).to.have.status(200);
                      expect(res.body.length).to.equal(2);
                      expect(res.body[0].lastUsedDate).to.exist;
                      expect(res.body[0].lastUsedIP).to.exist;
                      assert(!res.body[0].current);
                      expect(res.body[0].id).to.exist;
                      expect(res.body[1].lastUsedDate).to.exist;
                      expect(res.body[1].lastUsedIP).to.exist;
                      assert(res.body[1].current);
                      expect(res.body[1].id).to.exist;
                    })
                    .then(done)
                    .catch(done)
                })
                .catch(err => done(err))
            })
            .catch(err => done(err))
        })
        .catch(err => done(err))
    });
  });
  describe('### GET /auth/sessions/self', () => {
  });
});
