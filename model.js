const fs = require('fs');
const db = require('./db');

const files = fs.readdirSync(__dirname + '/models');
const js_files = files.filter(file => file.endsWith('.js'));

module.exports = {};

js_files.forEach(f => {
  console.log(`import model from ${f} files...`);
  const [name, _] = f.split('.');
  module.exports[name] = require(__dirname + '/models/' + name);
});

module.exports.sync = () => {
  db.sync();
};
