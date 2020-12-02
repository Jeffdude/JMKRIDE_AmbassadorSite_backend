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

});
