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
        .expect(httpStatus.Created)
        .expect('Content-type', /json/)
        .end((err, res) => {
          console.log(res);
          expect(res.created && res.ok);
          expect(!err);
          expect(res.body.id);
          done();
        });
      done();
    });
  });


  afterEach((done) => {
    sandbox.restore();
    done();
  });
});
