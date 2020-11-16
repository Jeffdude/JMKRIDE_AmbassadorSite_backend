const express = require('express');
const chai = require('chai');
const request = require('supertest');

describe('# Users API Request #', () => {
  let sandbox;

  beforeEach((done) => {
    sandbox = sinon.sandbox.create();
    done();
  });

  afterEach((done) => {
    sandbox.restore();
    done();
  });
});
