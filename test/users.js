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

const mockValidJWTNeeded = (sandbox) => {
  const fakeValidJWTNeeded = async (req, res, next) => {
    //FIXME
    // This must not be how you mock the jwt object. Hangs here.
    req.jwt = {userId: mockid, permissionLevel: PERMISSION_LEVELS.USER}
    return next()
  }

  let validJWTNeededMock = sandbox.replace(
    ValidationMiddleware,
    'validJWTNeeded',
    fakeValidJWTNeeded
  )

  return validJWTNeededMock
}

let server, sandbox, agent, validJWTNeededMock;

describe('# Server Endpoint Tests', function () {
  before((done) => {
    done();
  });

  beforeEach((done) => {
    sandbox = sinon.createSandbox();
    validJWTNeededMock = mockValidJWTNeeded(sandbox);
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
    console.log("after")
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
      it('should find present user', function (done) {
        let mockid = 'mockid';
        let mockuser = {
          _id: mockid,
          email: 'testemail@email.com',
          password: 'shouldnotbereturned',
        };

        //let mockFindById = sandbox.stub(
        //  mongoose.model('user'), 'findById',
        //).resolves(mockuser);

        //let spyFindById = sandbox.spy(
        //  UserModel, 'findById'
        //);
        console.log('before agent')

        agent
          .get('/api/v1/users/id/' + mockid)
          .end(function(err, res) {
            console.log('before agent')
            expect(res).to.have.status(200);
            expect(res._id).to.equal(mockid)
            expect(res.email).to.be.a.string;
            expect(res.password).to.be.undefined;
            //assert(mockFindById.calledWith(mockid))
            //assert(SpyFindById.calledWith(mockid))
            assert(validJWTNeededMock.called);
            done(err)
          })
      });

    });
  });
});
