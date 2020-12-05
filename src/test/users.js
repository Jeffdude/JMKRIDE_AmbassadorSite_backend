const { expect } = require('chai');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const sinon = require('sinon');
// https://github.com/underscopeio/sinon-mongoose/issues/58
require('../external/sinon-mongoose');
require('sinon-promise');
const assert = require('@sinonjs/referee').assert

const mongoose = require('../modules/mongoose.js');

const test_db = require('./db.js');
const UserModel = require('../users/model.js');

const debug = false;

let server, sandbox, agent;

describe('# Users Endpoint Tests', function () {
  before((done) => {
    mongoose.connectWithRetry(debug);
    done();
  })
  beforeEach((done) => {
    sandbox = sinon.createSandbox();
    server = require('../index.js')(debug);
    agent = chai.request(server).keepOpen();
    done();
  });

  afterEach((done) => {
    agent.close();
    sandbox.restore();
    test_db.clearDB(done);
  });

  after((done) => {
    require('../modules/mongoose.js').connection.close(() => {
      if(debug) {
        console.log("[+] MongoDB connection successfully destroyed.")
      }
      done()
    });
  });

  describe('### GET /server-status', () => {
    it('server-status is OK', function (done) {
      agent
        .get('/server-status')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          done(err)
        });
    });
  });
  describe('### POST /users/create', () => {
    it('should not create without email', function (done) {
      agent
        .post('/api/v1/users/create')
        .send({
          firstName: "Unittest",
          lastName: "User",
          password: "pass",
        })
        .end(function(err, res) {
          expect(res).to.have.status(500);
          expect(res.body.error).to.be.a('string');
          expect(res.error).to.exist;
          done(err);
        });
    });
    it('should not create without password', function (done) {
      agent
        .post('/api/v1/users/create')
        .send({
          firstName: "Unittest",
          lastName: "User",
          email: "testemail@email.com",
        })
        .end(function(err, res) {
          expect(res).to.have.status(500);
          expect(res.body.error).to.be.a('string');
          expect(res.error).to.exist;
          done(err);
        });
    });
    it('should create user', function (done) {
      let UserModelSpy = sandbox.spy(UserModel, 'createUser')

      agent
        .post('/api/v1/users/create')
        .send({
          email: "testemail@email.com",
          password: "pass",
        })
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body.id).to.exist;
          assert(UserModelSpy.called)
        })
        .then(() => done())
        .catch(err => done(err))
    });
    it('should not find unauthenticated user', function (done) {
      let mockid = 'mockid';
      let mockuser = {
        _id: mockid,
        email: 'testemail@email.com',
        password: 'shouldnotbereturned',
      };

      let mockFindById = sandbox.stub(
        mongoose.model('user'), 'findById',
      ).resolves(mockuser);

      let spyFindById = sandbox.spy(
        UserModel, 'findById'
      );

      agent
        .get('/api/v1/users/id/' + mockid)
        .end(function(err, res) {
          expect(res).to.have.status(401);
          assert(mockFindById.notCalled)
          assert(spyFindById.notCalled)
          done(err)
        })
    });
  });
  describe('### Users full integration', () => {
    it('should create, authenticate then find', function(done) {
      agent
        .post('/api/v1/users/create')
        .send({
          email: "testemail@email.com",
          password: "pass",
        })
        .end(function(err, res) {
          expect(res).to.have.status(201);
          expect(res.body.id).to.exist;
          let userid = res.body.id;
          agent
            .post('/api/v1/auth')
            .send({
              email: "testemail@email.com",
              password: "pass",
            })
            .end(function(err, res) {
              expect(res).to.have.status(201);
              expect(res.body.accessToken).to.exist;
              let accessToken = res.body.accessToken;
              expect(res.body.refreshToken).to.exist;
              expect(res.body.expiresIn).to.exist;
              agent
                .get('/api/v1/users/id/' + userid)
                .set(
                  'Authorization',
                  'Bearer ' + accessToken,
                )
                .end(function(err, res) {
                  expect(res).to.have.status(200);
                  expect(res.body._id).to.exist;
                  expect(res.body.email).to.equal('testemail@email.com');
                  expect(res.body.permissionLevel).to.equal('user');
                  done(err)
                })
            })
        })
    });
  });
});
