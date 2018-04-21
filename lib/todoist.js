'use strict';

const request = require('request');
const config = require('config');

exports.Todoist = class Todoist {
  constructor() {
  }

  static get API_URL() {
    return "https://beta.todoist.com/API/v8";
  }

  getTasksByProjectId(projectId) {
    let url = `${this.constructor.API_URL}/tasks?token=${config.todoist.apiToken}&project_id=${projectId}`;

    return new Promise((resolve, reject) => {
      request(url, function (err, res, body) {
        if (err) {
          reject(err);
        }
        resolve(JSON.parse(body));
      });
    });
  }

  shoppingLists() {
    return this.getTasksByProjectId(config.todoist.projectId.shopping).then((tasks) => {
      return tasks.map((t) => t.content);
    });
  }
};
