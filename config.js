const fs = require('fs');

const defalutConfig = './configs/config-default.js';
const testConfig = './configs/config-test.js';
const overrideConfig = './configs/config-override.js';

let config = {};

if (process.env.NODE_ENV === 'test') {
  console.log('load testConfig...');
  config = require(testConfig);
} else {
  console.log('load defaultConfig');
  config = require(defalutConfig);
  try {
    if (fs.statSync(overrideConfig).isFile()) {
      console.log('load overrideConfig...');
      config = Object.assign(config, require(overrideConfig));
    }
  } catch (error) {
    console.log('can not load overrideConfig...');
  }
}

module.exports = config;
