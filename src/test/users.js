const express = require('express');
const { expect } = require('chai');
const request = require('supertest');
const test_db = require('./db.js');

const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const sinon = require('sinon');
const app = require('../index.js');

require('sinon-mongoose');
require('sinon-as-promised');


describe('# Users API Requests #', () => {
  let sandbox;

  beforeEach((done) => {
    test_db.clearDatabase(() => {
      sandbox = sinon.sandbox.create();
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
        .then(res => {
          expect(res.body).to.have.property('id').which.is.not.undefined;
          done();
        });
    });
  });


  afterEach((done) => {
    sandbox.restore();
    done();
  });
});
