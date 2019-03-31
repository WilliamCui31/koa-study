const Sequelize = require('sequelize');
const uuid = require('node-uuid');
const config = require('./config');

console.log('initial sequelize ...', config);
const Op = Sequelize.Op;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  operatorsAliases: Op,
  pool: {
    max: 5,
    min: 0,
    idle: 1000
  }
});

const ID_TYPE = Sequelize.STRING(100);
function generateId() {
  return uuid.v4();
}

function defineModel(name, attributes) {
  const attrs = {};

  attrs.id = {
    type: ID_TYPE,
    primaryKey: true
  };

  for (let key in attributes) {
    const value = attributes[key];
    if (typeof value === 'object' && value['type']) {
      value.allowNull = value.allowNull || false;
      attrs[key] = value;
    } else {
      attrs[key] = {
        type: attributes[key],
        allowNull: false
      };
    }
  }

  [('createdAt', 'updatedAt', 'version')].forEach(key => {
    attrs[key] = {
      type: Sequelize.BIGINT,
      allowNull: false
    };
  });

  return sequelize.define(name, attrs, {
    tableName: name,
    timestamp: false,
    hooks: {
      beforeValidate: function (obj) {
        const now = Date.now();
        if (obj.isNewRecord) {
          if (!obj.id) {
            obj.id = generateId();
          }
          obj.createdAt = now;
          obj.updatedAt = now;
          obj.version = 0;
        } else {
          obj.updatedAt = Date.now();
          obj.version++;
        }
      }
    }
  });
}

module.exports = {
  generateId,
  defineModel,
  ...Sequelize,
  sync: () => {
    // only allow create ddl in non-production environment:
    if (process.env.NODE_ENV !== 'production') {
      sequelize
        .sync({ force: true })
        .then(() => {
          console.log('sync done,initial db OK!');
          process.exit(0);
        })
        .catch(e => {
          console.log(`failed:${e}`);
          process.exit(0);
        });
    } else {
      throw new Error("Cannot sync() when NODE_ENV is set to 'production'.");
    }
  }
};
