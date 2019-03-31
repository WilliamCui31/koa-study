const db = require('../db');

module.exports = db.defineModel('users', {
  email: {
    type: db.STRING(100),
    unique: true
  },
  name: db.STRING(100),
  password: db.STRING(100),
  gender: db.BOOLEAN
});
