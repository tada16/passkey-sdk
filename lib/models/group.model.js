'use strict';

const ApiModel = require('./api.model');
const PasswordModel = require('./password.model');
const util = require('../util');

module.exports = class GroupModel extends ApiModel {
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
      Rule: {},
      Keys: []
    };
    this._credential = {};
  }

  setCredential(userId, password) {
    this._credential.UserId = userId;
    this._credential.Password = password;
  }

  set(params) {
    if (!params) return;
    if (params.GroupId) this._data.GroupId = params.GroupId;
    if (params.UserId) this._data.UserId = params.UserId;
    if (params.Password) this._data.Password = params.Password;
    if (params.Rule) {
      if (params.Rule.Complex !== undefined) this._data.Rule.Complex = params.Rule.Complex;
      if (params.Rule.Length) this._data.Rule.Length = params.Rule.Length;
    }
    if (params.Keys) {
      this._data.Keys = [];
      for (const key of params.Keys) {
        this._data.Keys.push(key);
      }
    }
  }

  get() {
    return util.copy(this._data);
  }

  async create(cb = null) {
    /**
     *  params: {
     *    Rule: {
     *      Complex: {Boolean},
     *      Length: {Number}
     *    },
     *    Keys: [
     *      {
     *        KeyId: {String}
     *        Name: {String}
     *      }, // more items
     *    ]
     *  }
     */
    let errObject = null;
    let returnValue = null;
    try {
      const body = util.copy(this._data);
      const res = await this.callApi('create', '/group', body);
      if (res.Status === 'OK') {
        this._data.GroupId = res.GroupId;
        this._credential.UserId = body.UserId;
        this._credential.Password = body.Password;
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

  async load(cb = null) {
    let errObject = null;
    let returnValue = null;
    try {
      const body = {
        Credential: this._credential
      };

      const res = await this.callApi('get', `/group/${this._data.GroupId}`, body);
      if (res.Status === 'OK') {
        this.set(res.Item);
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

  async save(cb = null) {
    let errObject = null;
    let returnValue = null;
    try {
      const body = {
        Credential: this._credential
      };
      const resGet = await this.callApi('get', `/group/${this._data.GroupId}`, body);

      util.updateObject(body, this._getUpdateParams(resGet.Item, this._data));

      const res = await this.callApi('update', `/group/${this._data.GroupId}`, body);
      if (res.Status === 'OK') {
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

  async createPassword(argParams = null, cb = null) {
    let errObject = null;
    let returnValue = null;
    try {
      const params = argParams || {};
      const body = {};
      if (params.Rule) body.Rule = params.Rule;

      const res = await this.callApi('create', `/group/${this._data.GroupId}/password`, body);
      if (res.Status === 'OK') {
        const pwd = new PasswordModel();
        pwd.setId(res.PasswordId);
        pwd.setPassword(res.Password);
        returnValue = pwd;
      } else {
        errObject = new Error(res.Message);
      }
    } catch (err) {
      errObject = err;
    } finally {
      return this.term(cb, errObject, returnValue);
    }
  }

  updateKey(key) {
    if (key && !key.KeyId) throw new Error('Key.KeyId is required');
    if (key && key.Name === undefined) throw new Error('Key.Name is required');

    const keys = this._data.Keys;

    for (let i = 0 ; i < keys.length ; i++) {
      if (keys[i].KeyId === key.KeyId) {
        keys[i] = key;
        return;
      }
    }
    keys.push(key);
  }

  deleteKey(keyId) {
    if (!keyId) throw new Error('KeyId is empty');

    const keys = this._data.Keys;
    for (let i = 0 ; i < keys.length ; i++) {
      if (keys[i].KeyId === keyId) {
        keys.splice(i, 1);
        return;
      }
    }
    throw new Error (`Key.KeyId(${keyId}) not found`);
  }


  _getUpdateParams(orgData, newData) {
    const updateItem = {
      Rule: {},
      Keys: []
    };
    const deleteItem = {
      Keys: []
    };

    if (newData.UserId && newData.UserId !== orgData.UserId) {
      updateItem.UserId = newData.UserId;
    }
    if (newData.Password && newData.Password !== orgData.Password) {
      updateItem.Password = newData.Password;
    }
    if (newData.Rule) {
      if (newData.Rule.Length && newData.Rule.Length !== orgData.Rule.Length) {
        updateItem.Rule.Length = newData.Rule.Length;
      }
      if (newData.Rule.Complex !== undefined && newData.Rule.Complex !== orgData.Rule.Complex) {
        updateItem.Rule.Complex = newData.Rule.Complex;
      }
    }
    let newKeys = {};
    if (newData.Keys && newData.Keys.length > 0) {
      for (let key of newData.Keys) {
        newKeys[key.KeyId] = {hit: false, item: key};
      }
    }
    // 追加
    if (orgData.Keys && orgData.Keys.length > 0) {
      for (let key of orgData.Keys) {
        let hitKey = newKeys[key.KeyId];
        if (hitKey) {
          hitKey.hit = true;
          // update
          if (hitKey.item.Name !== key.Name) updateItem.Keys.push(hitKey.item);
        } else {
          // delete
          deleteItem.Keys.push(key.KeyId);
        }
      }
    }
    for (let key in newKeys) {
      // add
      if (!newKeys[key].hit) updateItem.Keys.push(newKeys[key].item);
    }

    return {UpdateItem: updateItem, DeleteItem: deleteItem};
  }
};
