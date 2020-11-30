const express = require('express');
const { expect } = require('chai');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const sinon = require('sinon');

const test_db = require('./db.js');

let server, agent;

describe('# Server Endpoint Tests', function () {
  before((done) => {
    server = require('../src/index.js')();
    done();
  });

  beforeEach((done) => {
    agent = chai.request(server).keepOpen()
    done();
  });

  afterEach((done) => {
    agent.close();
    done();
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
  describe('## Users API Requests #', () => {
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
        agent
          .post('/api/v1/users/create')
          .send({
            email: "testemail@email.com",
            password: "pass",
          })
          .end(function(err, res) {
            expect(res).to.have.status(201);
            done(err);
          });
      });
    });
  });
});
