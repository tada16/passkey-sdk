'use strict';

const DEF = {
  API: {
    URL: process.env.PASSKEY_API_URL,
    KEY: process.env.PASSKEY_API_KEY,
  }
};
const request = require('request');

module.exports = class ApiModel {
  static get GET() {
    return 'get';
  }
  static get UPDATE() {
    return 'update';
  }
  static get DELETE() {
    return 'delete';
  }
  static get CREATE() {
    return 'create';
  }


  /**
   * @param {Object} params -  設定情報
   */
  constructor(params = {}) {
    this._api = {};
    this._api.url = (params.Api && params.Api.Url) ? params.Api.Url : DEF.API.URL;
    this._api.key = (params.Api && params.Api.Key) ? params.Api.Key : DEF.API.KEY;
  }

  async callApi (method, action, body) {
    const params = {
      url: this._api.url + action,
      headers: {
        'Content-type': 'application/json',
        'x-api-key': this._api.key
      },
      json: body
    };

    let res = null;
    switch (method) {
      case ApiModel.GET:
        res = await this._callRequest(request.post.bind(request), params);
        break;
      case ApiModel.CREATE :
        res = await this._callRequest(request.post.bind(request), params);
        break;
      // case ApiModel.DELETE :
      //   return this._callRequest(request.delete.bind(request), params, cb);
      case ApiModel.UPDATE :
        res = await this._callRequest(request.patch.bind(request), params);
        break;
      default:
        let err = new Error(`API method(${method}) is strange`);
        throw err;
    }
    if (res.Status === undefined) {
      res.Status = 'ERROR';
      res.Message = res.Message || res.message;
    }
    return res;
  }

  _callRequest (req, params) {
    const p = new Promise((resolve, reject) => {
      req(params, (err, res) => {
        if (err) return reject(err);
        const result = res.body;
        result.response = {
          statusCode: res.statusCode,
          headers: res.headers
        };
        resolve(result);
      });
    });
    return p;
  }

  term(cb, err, res) {
    if (cb) {
      cb(err, res);
    } else {
      if (err) {
        throw err;
      } else {
        return res;
      }
    }
  }
};
