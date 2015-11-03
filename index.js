'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('meshblu-mailgun')
var fs = require('fs');
var mailgun = require('mailgun-js');



var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    from: {
      type: 'string',
      required: true
    },
    to: {
      type: 'string',
      required: true
    },
    text: {
      type: 'string',
      required: true
    },
    subject: {
      type: 'string',
      required: true
    },
    b64: {
      type: 'string'
    }
  }
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    apiKey: {
      type: 'string',
      required: true,
      default: 'key-0c40abe7faa0b6e9cc6f59c13512884b'
    },
    domain: {
      type: 'string',
      requite: true,
      default: 'sandbox2fab61cf8435475e99c70bbe316eb101.mailgun.org'
    }
  }
};

function Plugin(){
  var self = this;
  self.options = {};
  self.messageSchema = MESSAGE_SCHEMA;
  self.optionsSchema = OPTIONS_SCHEMA;
  return self;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var self = this;
  var payload = message.payload;
  var img = payload.b64;
  var data = img.replace(/^data:image\/\w+;base64,/, "");
  var buf = new Buffer(data, 'base64');
  fs.writeFile('octoblu.jpeg', buf);
  var filename = 'octoblu.jpeg';
  var file = fs.readFileSync(filename);


  var attch = new mailgun.Attachment({data: file, filename: filename});

  var data = {
    from: payload.from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    attachment: attch
  };

  mailgun.messages().send(data, function (error, body) {
    console.log(body);
  });
};

Plugin.prototype.onConfig = function(device){
  var self = this;
  self.setOptions(device.options||{});
};

Plugin.prototype.setOptions = function(options){
  var self = this;
  self.options = options;
  mailgun.apiKey = self.options.apiKey;
  mailgun.domain = self.options.domain;
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
