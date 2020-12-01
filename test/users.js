const express = require('express');
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
const PERMISSION_LEVELS = require('../src/config.js').permissionLevels;
const UserModel = require('../src/users/model.js');
const ValidationMiddleware = require(
  '../src/middleware/validation.js'
)

let server, sandbox, agent;

describe('# Server Endpoint Tests', function () {
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
    try {
      test_db.clearDatabase(done);
    } catch (error) {
      done();
    }
  });

  after((done) => {
    require('../src/modules/mongoose.js').connection.close(done);
  });

  it('server-status is OK', function testServerStatus(done) {
    agent
      .get('/server-status')
      .end(function(err, res) {
        expect(res).to.have.status(200);
        done(err)
      });
  });
  describe('## Users API Requests', () => {
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
            expect(res).to.have.status(400);
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
            expect(res).to.have.status(400);
            expect(res.body.error).to.be.a('string');
            expect(res.error).to.exist;
            done(err);
          });
      });
      it('should create user', function (done) {
        let mockid = 'mockid'

        let UserModelSpy = sandbox.spy(UserModel)
        let UserMongooseModelStub = sandbox.stub(
          mongoose.model('user').prototype, 'save'
        ).resolves({'_id': mockid})

        agent
          .post('/api/v1/users/create')
          .send({
            email: "testemail@email.com",
            password: "pass",
          })
          .end(function(err, res) {
            expect(res).to.have.status(201);
            expect(res.body.id).to.equal(mockid);
            assert(UserModelSpy.createUser.calledOnce)
            assert(UserMongooseModelStub.called)
            done(err);
          });
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
});
