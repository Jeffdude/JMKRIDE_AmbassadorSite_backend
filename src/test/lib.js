exports.before = (done) => {
  mongoose.connectWithRetry(debug);
  done();
}
exports.beforeEach = (done) => {
  sandbox = sinon.createSandbox();
  let setupPromise;
  [server, setupPromise] = makeServer(debug);
  agent = chai.request(server).keepOpen();
  setupPromise.then(done);
};

exports.afterEach = (done) => {
  agent.close();
  sandbox.restore();
  test_db.clearDB(done);
};

exports.after = (done) => {
  require('../modules/mongoose.js').connection.close(() => {
    if(debug) {
      console.log("[+] MongoDB connection successfully destroyed.")
    }
    done()
  });
};
