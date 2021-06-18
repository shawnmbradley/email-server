// email/message-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'message';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    eml: { type: String, required: false },
    headers: {
      type: Map
    },
    headerLines: { type: Object },
    attachments: [],
    text: {
      type: String
    },
    textAsHtml: {
      type: String
    },
    html: { type: String },
    from: { type: Object },
    to: { type: Object },
    subject: { type: String },
    messageId: { type: String },
    textAsHtml: { type: String }
  }, {
    timestamps: true
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
  
};
