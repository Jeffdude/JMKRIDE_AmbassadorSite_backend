const express = require('express');
const { expect } = require('chai');
const request = require('supertest');
const test_db = require('./db.js');

const httpStatus = require('http-status');
const sinon = require('sinon');

require('../src/external/sinon-mongoose');
//require('sinon-as-promised');


let server, sandbox;

describe('# Server Endpoint Tests', function () {
  beforeEach((done) => {
    server = require('../src/index.js')();
    sandbox = sinon.createSandbox();
    test_db.clearDatabase(done);
  });

  afterEach((done) => {
    sandbox.restore();
    require('../src/modules/mongoose.js').connection.close(
      () => server.close(done)
    );
  });

  it('server-status is OK', function testServerStatus(done) {
    request(server)
    .get('/server-status')
    .expect(200, done);
  });

  describe('## Users API Requests #', () => {
    describe('### POST /users/create', () => {
      it('should return the created task successfully', function testUserCreate(done) {
        request(server)
          .post('/api/v1/users/create')
          .send({
            firstName: "Unittest",
            lastName: "User",
            email: "unittest@test.com",
            password: "unittest",
          })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(201, done)
          /*.end((err, res) => {
            console.log(res);
            expect(res.created);
            expect(res.ok);
            expect(res.body);
            expect(res.body.id);
            done(err);
          })
          */
      });
    });
  });
});
