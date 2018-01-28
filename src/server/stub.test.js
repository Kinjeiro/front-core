// @guide - если запускать через моку в IDE нужно дописать:
// --require babel-register --require ./node_modules/@reagentum/front-core/test/server/init-server-tests.js
// и переопредились в проекте \test\server\init\get-project-server-runner-class.js

describe('Stub test', () => {
  it('should be ok', () => {
    expect(true).to.be.true;
  });
});
