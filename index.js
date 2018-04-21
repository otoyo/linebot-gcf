'use strict';

const line = require('@line/bot-sdk');
const config = require('config');
const Todoist = require('./lib/todoist.js').Todoist;

// create LINE SDK client
const client = new line.Client(config.line);

function buildReplyText(text) {
  if (!text.match(/ホイちゃん/)) {
    return Promise.resolve(null);
  }

  let replyText;
  const talkscripts = [
    String.fromCodePoint('0x1F4A9'),
    String.fromCodePoint('0x1F495'),
    String.fromCodePoint('0x1F4A4')
  ];

  if (text.match(/買い物リスト/)) {
    return (new Todoist())
      .shoppingLists()
      .then((items) => Promise.resolve(items.join("\n")));
  } else {
    return Promise.resolve(talkscripts[Math.floor(Math.random() * talkscripts.length)]);
  }
}

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  return buildReplyText(event.message.text)
    .then((replyText) => {
      // use reply API
      return client.replyMessage(event.replyToken, { type: 'text', text: replyText });
    });
}

exports.webhook = function webhook(req, res) {
  const signature = req.get('x-line-signature');

  if (!signature) {
    throw new line.SignatureValidationFailed("no signature");
  }

  if (!line.validateSignature(req.rawBody, config.line.channelSecret, signature)) {
    throw new line.SignatureValidationFailed("signature validation failed", signature);
  }

  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((error) => console.error(error));
};
