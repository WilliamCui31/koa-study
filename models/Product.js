const db = require('../db');

module.exports = db.defineModel('products', {
  name: {
    type: db.STRING(20),
    unique: true
  },
  manufacturer: db.STRING(50),
  price: db.FLOAT
});