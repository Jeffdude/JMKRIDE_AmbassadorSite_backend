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
const permissionLevels = require('../config.js').permissionLevels;

const debug = false;

let server, sandbox, agent;

describe('# Challenges Endpoint Tests', function () {
  before((done) => {
    mongoose.connectWithRetry(debug);
    done();
  })
  beforeEach((done) => {
    sandbox = sinon.createSandbox();
    let setupPromise;
    [server, setupPromise] = require('../index.js')(debug);
    agent = chai.request(server).keepOpen();
    setupPromise.then(done);
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

  describe('### POST /challenges/create', () => {
    it('should not create without auth', (done) => {
      agent
        .post('/api/v1/challenges/create')
        .send({
          title: "Unit Test Challenge",
          shortDescription: "Short Description",
          longDescription: "Long Description",
          award: 10,
          structure: [
            {
              title: "Name",
              fieldType: "TEXT_SHORT"
            }
          ]
        })
        .then(res => {
          expect(res).to.have.status(401);
        })
        .then(done)
        .catch(done);
    });
    it('should create with auth', (done) => {
      let userid, accessToken;
      agent
        .post('/api/v1/users/create')
        .send({
          email: "testemail@email.com",
          password: "pass",
        })
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body.id).to.exist;
          userid = res.body.id;
          UserModel
            .patchUser(userid, {permissionLevel: permissionLevels.ADMIN})
            .then(() => {
              agent
                .post('/api/v1/auth')
                .send({
                  email: "testemail@email.com",
                  password: "pass",
                })
                .then(res => {
                  expect(res).to.have.status(201);
                  expect(res.body.accessToken).to.exist;
                  accessToken = res.body.accessToken;
                  expect(res.body.refreshToken).to.exist;
                  expect(res.body.expiresIn).to.exist;
                })
                .then(() => {
                  let ChallengeMongooseModelStub = sandbox.stub(
                    mongoose.model('challenge').prototype, 'save'
                  ).resolves({'_id': 'mockid'})
                  agent
                    .post('/api/v1/challenges/create')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                      title: "Unit Test Challenge",
                      shortDescription: "Short Description",
                      longDescription: "Long Description",
                      award: 10,
                      structure: [
                        {
                          title: "Name",
                          fieldType: "TEXT_SHORT"
                        }
                      ]
                    })
                    .then(res => {
                      expect(res).to.have.status(201);
                      expect(res.body).to.not.be.empty;
                      expect(res.body.id).to.equal('mockid');
                      assert(ChallengeMongooseModelStub.called);
                    })
                    .then(done)
                    .catch(done);
                })
                .catch(done);
            })
            .catch(done);
        })
        .catch(done);
    })
    it('should create with auth and find', (done) => {
      let userid, accessToken, ambassadorAccessToken, challengeId;
      agent
        .post('/api/v1/users/create')
        .send({
          email: "testemail@email.com",
          password: "pass",
        })
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body.id).to.exist;
          userid = res.body.id;
          UserModel
            .patchUser(userid, {permissionLevel: permissionLevels.ADMIN})
            .then(() => {
              agent
                .post('/api/v1/auth')
                .send({
                  email: "testemail@email.com",
                  password: "pass",
                })
                .then(res => {
                  expect(res).to.have.status(201);
                  expect(res.body.accessToken).to.exist;
                  accessToken = res.body.accessToken;
                  expect(res.body.refreshToken).to.exist;
                  expect(res.body.expiresIn).to.exist;
                })
                .then(() => {
                  agent
                    .post('/api/v1/challenges/create')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                      title: "Unit Test Challenge",
                      shortDescription: "Short Description",
                      longDescription: "Long Description",
                      award: 10,
                      structure: [
                        {
                          title: "Name",
                          fieldType: "TEXT_SHORT"
                        }
                      ]
                    })
                    .then(res => {
                      expect(res).to.have.status(201);
                      expect(res.body).to.not.be.empty;
                      expect(res.body.id).to.exist;
                      challengeId = res.body.id;
                    })
                    .then(() => {
                      agent
                        .post('/api/v1/users/create')
                        .send({
                          email: "ambassadoremail@email.com",
                          password: "pass",
                        })
                        .then(res => {
                          expect(res).to.have.status(201);
                          expect(res.body.id).to.exist;
                          userid = res.body.id;
                          UserModel
                            .patchUser(
                              userid,
                              {permissionLevel: permissionLevels.AMBASSADOR}
                            )
                            .then(() => {
                              agent
                                .post('/api/v1/auth')
                                .send({
                                  email: "ambassadoremail@email.com",
                                  password: "pass",
                                })
                                .then(res => {
                                  expect(res).to.have.status(201);
                                  expect(res.body.accessToken).to.exist;
                                  ambassadorAccessToken = res.body.accessToken;
                                  expect(res.body.refreshToken).to.exist;
                                  expect(res.body.expiresIn).to.exist;
                                })
                                .then(() => {
                                  agent
                                    .get('/api/v1/challenges?challengeId=' + challengeId)
                                    .set('Authorization', 'Bearer ' + ambassadorAccessToken)
                                    .then(res => {
                                      expect(res).to.have.status(200);
                                      expect(res.body).to.not.be.empty;
                                      expect(res.body._id).to.exist;
                                      expect(res.body.title).to.equal("Unit Test Challenge");
                                      expect(res.body.shortDescription).to.equal(
                                        "Short Description"
                                      );
                                      expect(res.body.longDescription).to.equal(
                                        "Long Description"
                                      );
                                      expect(res.body.award).to.equal(10);
                                      expect(res.body.structure).to.have.lengthOf(1);
                                    })
                                    .then(done)
                                    .catch(done);
                                })
                                .catch(done);
                            })
                            .catch(done);
                        })
                        .catch(done);
                    })
                    .catch(done);
                })
                .catch(done);
            })
            .catch(done);
        })
        .catch(done);
    })
  })
});
