const assert = require('assert');
const app = require('../../../src/app');

describe('\'email/message\' service', () => {
  it('registered the service', () => {
    const service = app.service('email/message');

    assert.ok(service, 'Registered the service');
  });
});
