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

let server, sandbox, agent;

describe('# Auth Endpoint Tests', function () {
  before((done) => {
    done();
  });

  beforeEach((done) => {
    sandbox = sinon.createSandbox();
    server = require('../src/index.js')(false);
    agent = chai.request(server).keepOpen();
    done();
  });

  afterEach((done) => {
    agent.close();
    sandbox.restore();
    test_db.clearDatabase(done);
  });

  after((done) => {
    require('../src/modules/mongoose.js').connection.close(done);
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
    it('should auth with valid email and password', (done) => {
      let UserModelMock = sandbox.stub(
        UserModel, 'findByEmail',
      ).resolves([
        {
          _id: "mockid",
          email: "valid@atest.com",
          password: "1$UiK/RqvSF8+Ou0JhM82eXkZLwgTVdoZg/xm+HEgvrSUX0Ue/N7rKrj8u5hf0XXsAJeHVSpn7bUi5/aLuBdaNkA=="
        }
      ])

      agent
        .post('/api/v1/auth')
        .send({"email": "valid@test.com", "password": "valid"})
        .then((res) => {
          expect(res).to.have.status(201);
          expect(res.body.accessToken).to.exist;
          expect(res.body.refreshToken).to.exist;
          expect(res.body.expiresIn).to.exist;
          assert(UserModelMock.called); 
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

      let sessionModelMock = sandbox.stub(
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
        })
        .then(() => {
          UserModelMock.resetHistory();
          agent
            .post('/api/v1/auth/refresh')
            .set('Authorization', 'Bearer ' + accessToken)
            .send({"refresh_token": refreshToken})
            .then((res) => {
              //console.log(res)
              expect(res).to.have.status(201);
              expect(res.body.accessToken).to.exist;
              accessToken = res.body.accessToken;
              expect(res.body.refreshToken).to.exist;
              refreshToken = res.body.refreshToken;
              expect(res.body.expiresIn).to.exist;
              assert(sessionModelMock.called)
            })
            .then(done)
            .catch(done)
        })
        .catch(done)
    });
  });
});
