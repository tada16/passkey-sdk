'use strict';

const Type = {
  isObject: function (v) {
    return (Object.prototype.toString.call(v) === '[object Object]');
  },
  isArray: function (v) {
    return (Object.prototype.toString.call(v) === '[object Array]');
  },
  isFunction: function (v) {
    return (Object.prototype.toString.call(v) === '[object Function]');
  },
  isBoolean: function (v) {
    return (Object.prototype.toString.call(v) === '[object Boolean]');
  },
  isString: function (v) {
    return (Object.prototype.toString.call(v) === '[object String]');
  },
  isNumber: function (v) {
    return (Object.prototype.toString.call(v) === '[object Number]');
  },
  isNull: function (v) {
    return (v === null);
  },
  isUndefined: function (v) {
    return (v === undefined);
  }
};

const each = function (object, iterFunction) {
  let abort = {};
  for (var key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      var ret = iterFunction.call(this, key, object[key]);
      if (ret === abort) break;
    }
  }
};

const updateObject = function (obj1, obj2) {
  // Array is not work
  if (! Type.isObject(obj1) || ! Type.isObject(obj2)) throw Error('type is not object.');
  each(obj2, function iterator(key, item) {
    obj1[key] = item;
  });
  return obj1;
};


const mergeObject = function(obj1, obj2) {
  // Array is not work
  if (! Type.isObject(obj1) || ! Type.isObject(obj2)) throw Error('type is not object.');
  return updateObject(copy(obj1), copy(obj2));
};

const copy = function(object) {
  return JSON.parse(JSON.stringify(object));
};

const toStringObject = function(object) {
  return JSON.stringify(object, null,'\t');
};

const isEmpty = function(obj) {
  if (!obj) return true;
  if (!Type.isObject(obj)) return true;
  return !Object.keys(obj).length;
};

const resultOk = function(item = null) {
  let result = {
    Status: 'OK'
  };
  if (item) updateObject(result, item);
  return result;
};

const resultError = function(err) {
  let result = {
    Status: 'ERROR',
    Message: err.message
  };
  return result;
};

const getRandomString = function (len = 8) {
  let range = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let max = range.length;
  var code = '';
  for (let i = 0 ; i < len ; i++) {
    code += range[Math.floor(Math.random() * max)];
  }
  return code;
};


module.exports = {
  updateObject,
  mergeObject,
  copy,
  toStringObject,
  isEmpty,
  resultOk,
  resultError,
  getRandomString,
  Type
};
