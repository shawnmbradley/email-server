// Initializes the `email/message` service on path `/email/message`
const { Message } = require('./message.class');
const createModel = require('../../../models/message.model');
const hooks = require('./message.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/email/message', new Message(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('email/message');

  service.hooks(hooks);
};
