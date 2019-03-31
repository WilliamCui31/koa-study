const db = require('../db');

module.exports = db.defineModel('pets', {
  name: {
    type: db.STRING(100),
    unique: true
  },
  gender: db.BOOLEAN,
  birth: db.STRING(10)
});
