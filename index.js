'use strict';

const line = require('@line/bot-sdk');
const config = require('config');

// create LINE SDK client
const client = new line.Client(config);

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  const text = event.message.text;

  if (!text.match(/ホイちゃん/)) {
    return Promise.resolve(null);
  }

  const talkscripts = [
    String.fromCodePoint('0x1F4A9'),
    String.fromCodePoint('0x1F495'),
    String.fromCodePoint('0x1F4A4')
  ];
  const replyText = talkscripts[Math.floor(Math.random() * talkscripts.length)];

  // use reply API
  return client.replyMessage(event.replyToken, { type: 'text', text: replyText });
}

exports.webhook = function webhook(req, res) {
  const signature = req.get('x-line-signature');

  if (!signature) {
    throw new line.SignatureValidationFailed("no signature");
  }

  if (!line.validateSignature(req.rawBody, config.channelSecret, signature)) {
    throw new SignatureValidationFailed("signature validation failed", signature);
  }

  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result).catch())
    .catch((error) => console.error(error));
};
