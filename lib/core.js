'use strict';

const npm = require('../package.json');

const Passkey = { util: require('./util') };

Passkey.util.updateObject(Passkey, {
  VERSION: npm.version,

  Group: require('./models/group.model'),
  Password: require('./models/password.model'),

});

module.exports = Passkey;
