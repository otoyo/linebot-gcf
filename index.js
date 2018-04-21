'use strict';

const line = require('@line/bot-sdk');
const language = require('@google-cloud/language');
const config = require('config');
const Todoist = require('./lib/todoist.js').Todoist;

// create LINE SDK client
const lineClient = new line.Client(config.line);

// create Natural Language API client
const langClient = new language.LanguageServiceClient();

function buildReplyText(event) {
  const text = event.message.text;

  if (event.source.userId === config.user.wife.lineUserId || event.source.userId === config.user.husband.lineUserId) {
    if (text.match(/[？！]/)) {
      const document = {
        content: text,
        type: 'PLAIN_TEXT'
      };

      return langClient
        .analyzeSentiment({ document: document })
        .then(results => {
          const sentiment = results[0].documentSentiment;

          console.log(`Sentiment score: ${sentiment.score}`);
          console.log(`Sentiment magnitude: ${sentiment.magnitude}`);

          let replyText;
          if (sentiment.score >= 0) {
            replyText = 'こたけも嬉しいにゃ';
          } else {
            replyText = 'こたけはいつも平常心にゃ';
          }
          replyText = replyText + `[${Math.round(sentiment.score * 100) / 100.0}]`;

          return Promise.resolve(replyText);
        })
        .catch(err => {
          console.error('ERROR:', err);
          return Promise.resolve(null);
        });
    }
  }

  if (!text.match(/こたけ/)) {
    return Promise.resolve(null);
  }

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

  return buildReplyText(event)
    .then((replyText) => {
      // use reply API
      if (!!replyText) {
        return lineClient.replyMessage(event.replyToken, { type: 'text', text: replyText });
      }
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
