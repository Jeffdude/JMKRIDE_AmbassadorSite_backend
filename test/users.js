const express = require('express');
const { expect } = require('chai');
const request = require('supertest');
const test_db = require('./db.js');

//const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const sinon = require('sinon');
const app = require('../src/index.js');

require('../src/external/sinon-mongoose');
//require('sinon-as-promised');


describe('# Users API Requests #', () => {
  let sandbox;

  beforeEach((done) => {
    test_db.clearDatabase(() => {
      sandbox = sinon.createSandbox();
      done();
    });
  });

  describe('### POST /users/create', () => {
    it('should return the created task successfully', (done) => {
      request(app)
        .post('/api/v1/users/create')
        .send({
          firstName: "Unittest",
          lastName: "User",
          email: "unittest@test.com",
          password: "unittest",
        })
        .set('Accept', 'application/json')
        .expect(httpStatus.Created)
        .expect('Content-type', /json/)
        .then(res => {
          console.log(res);
          expect(res.created);
          expect(res.ok);
          expect(res.body);
          expect(res.body.id);
        })
        .end(done);
    });
  });


  afterEach((done) => {
    sandbox.restore();
    done();
  });
});
