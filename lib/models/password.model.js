'use strict';

const ApiModel = require('./api.model');
const util = require('../util');

module.exports = class PasswordModel extends ApiModel {
  /**
   * @param {Object} params -  設定情報
   */
  constructor(params = {}) {
    super(params);
    /**
     *  params: {
     *    Api: {
     *      Url: 'https://xxxx',
     *      Key: 'APIKEY'
     *    }
     *  }
     */
    this.clear();
  }

  clear() {
    this._data = {
      Id: '',
      Password: ''
    };
  }

  getId() {
    return (this._data.Id);
  }
  getPassword() {
    return (this._data.Password);
  }

  setId(id) {
    this._data.Id = id;
  }
  setPassword(password) {
    this._data.Password = password;
  }

  async verify(otp, argPasswordId = null, cb = null) {
    let errObject = null;
    let returnValue = null;
    try {
      const body = {
        Otp: otp
      };
      const id = argPasswordId || this._data.Id;
      const res = await this.callApi('get', `/pw/${id}`, body);

      this._data.Id = id;
      this._data.Password = '';

      if (res.Status === 'OK') {
        this._data.Password = res.Password;
        returnValue = res;
      } else {
        errObject = new Error(res.Message);
      }
    } catch (err) {
      errObject = err;
    } finally {
      return this.term(cb, errObject, returnValue);
    }
  }

};
