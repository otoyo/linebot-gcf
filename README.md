# linebot-gcf

A serverless LINE Bot sample working on Google Cloud Functions(GCF).

Introduction(Japanese): http://alpacat.hatenablog.com/entry/linebot-gcf

## Preparation

Preparation before deploy.

* Cloud Functions / HTTP Tutorial
    * [https://cloud.google.com/functions/docs/tutorials/http?hl=ja]
* LINE Messaging API
    * [https://developers.line.me/ja/services/messaging-api/]

## Deploy

Put `config/default.json` as follows:

```json
{
  "channelAccessToken": "xxxx",
  "channelSecret": "xxxx"
}
```

Deploy to GCF.

```sh
$ gcloud beta functions deploy webhook --trigger-http --source .
```
