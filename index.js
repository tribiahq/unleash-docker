'use strict';

const unleash = require('unleash-server');
const authHook = require('./auth-hook');

let options = {
  adminAuthentication: 'custom',
  preRouterHook: authHook,
};

unleash.start(options).then(unleash => {
  console.log(`Unleash started on :${unleash.app.get('port')}`)
});
