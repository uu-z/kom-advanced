const Mhr = require("menhera").default;
const mongoose = require("mongoose");
const _ = require("lodash");
const uniqueValidator = require("mongoose-unique-validator");
const paginate = require("mongoose-paginate");
const hidden = require("mongoose-hidden");
const autopopulate = require("mongoose-autopopulate");
const bcrypt = require("mongoose-bcrypt");

paginate.options = {
  lean: true,
  limit: 20
};

const globalPlugins = [bcrypt, hidden, autopopulate, uniqueValidator, paginate];
globalPlugins.forEach(plugin => {
  mongoose.plugin(plugin);
});

module.exports = {
  name: "Mongoose",
  $models: {
    $({ _key, _val, cp }) {
      const { schema = {}, plugins = [], set = {}, methods = {} } = _val;
      const Schema = new mongoose.Schema(schema);
      plugins.forEach(plugin => {
        Schema.plugin(plugin);
      });
      _.each(set, (val, key) => {
        Schema.set(key, val);
      });
      _.each(methods, (val, key) => {
        Schema.methods.key = val;
      });

      const model = mongoose.model(_key, Schema);
      _val.model = model;
      Object.assign(cp.models[_key], {
        model
      });
      _.set(Mhr, `models.${_key}`, _val);
    }
  },
  $start: {
    async app() {
      const { MONGO_URL, MONGO_DATABASE } = _.get(Mhr, "config", {});
      await mongoose.connect(
        `mongodb://${MONGO_URL}/${MONGO_DATABASE}`,
        {
          useCreateIndex: true,
          useNewUrlParser: true
        }
      );
      console.success("mongodb start~~~");
    }
  },
  MongooseUtils: {
    convertParams(name, values) {
      const model = mongoose.models[name];
      return _.pick(values, _.keys(model.schema));
    },
    model(name) {
      return mongoose.models[name];
    },
    create(name, params) {
      const model = mongoose.models[name];
      return model.create(params);
    },
    findOne(name, params) {
      const model = mongoose.models[name];
      return model.findOne(params);
    },
    updateOne(name, query, values) {
      const data = utils.convertParams(name, values);
      const model = mongoose.models[name];
      return model.updateOne(query, data);
    },
    paginate(name, query, paginate) {
      const model = mongoose.models[name];
      return model.paginate(query, paginate);
    }
  }
};
