'use strict';

let _        = require('lodash');
let mongoose = require('mongoose');
let should   = require('should');
let sinon    = require('sinon');

exports.getObjectId = mongoose.Types.ObjectId;

// TODO: deprecated
exports.getList = (modelType, sortField, selectFields) => {
  let query = modelType.find({});
  if (sortField) {
    query.sort(sortField);
  }
  if (selectFields) {
    query.select(selectFields);
  }
  return query.exec();
};

// TODO: deprecated
exports.getSingleById = (modelType, id) => {
  return modelType.findById(id);
};

// TODO: test it
exports.assert = (actual, expected) => {
  let self = this;

  if (_assertIfExpectedIsNil(actual, expected) ||
    _assertIfExpectedIsArray(actual, expected) ||
    _assertIfExpectedIsSimplePrim(actual, expected)
  ) {
    return;
  }

  if (actual instanceof mongoose.Document) {
    actual = actual.toObject();
  }

  let expectedFields = _.keys(expected);
  should(actual).have.properties(expectedFields);

  _.each(expectedFields, field => {
    let actualVal = actual[field];
    let expectedVal = expected[field];

    if (_.isArray(expectedVal)) {
      self.assert(actualVal, expectedVal);
      return;
    }

    _assert(field, actualVal, expectedVal);
  });
};

// TODO: deprecated
exports.sinonMatch = (expected) => {
  let self = this;
  return sinon.match(actual => {
    try {
      self.assert(actual, expected);
      return true;
    } catch (err) {
      return false;
    }
  });
};

// TODO: make private
exports.assertId = (actual, expected) => {
  if (expected === '_mock_') {
    should(actual.toString()).match(/^[a-z|\d]{24}$/);
  } else {
    should(actual.toString()).equal(expected.toString());
  }
};

exports.assertResponse = (res, expectedStatus, expectedBody) => {
  if (expectedStatus === 204) {
    should(res.headers['content-type']).be.undefined();
    should(res.body).be.undefined();
  } else {
    should(res.headers['content-type']).match(/application\/json/);
    exports.assert(res.body, expectedBody);
  }
};

// TODO: make private
exports.isSimplePrim = (prim) => {
  return _.isBoolean(prim) ||
         _.isNumber(prim) ||
         _.isString(prim) ||
         _.isDate(prim);
};

// TODO: deprecated
exports.buildQuery = (params) => {
  let query = '';
  _.each(params, (value, key) => {
    query += key + '=' + value + '&';
  });
  return _.trimEnd(query, '&');
};

exports.processError = (actual, expected, done) => {
  if (expected instanceof Error) {
    try {
      should(actual).eql(expected);
      done();
    } catch (err) {
      done(err);
    }
  } else {
    done(actual);
  }
};

// TODO: deprecated
exports.processErrorNoMessage = (actual, expected, done) => {
  if (expected instanceof Error) {
    try {
      should(actual.name).eql(expected.name);
      should(actual.status).eql(expected.status);
      done();
    } catch (err) {
      done(err);
    }
  } else {
    done(actual);
  }
};

exports.resolveOrReject = (err, resolve, reject) => {
  if (err) {
    reject(err);
  } else {
    resolve();
  }
};

let _assert = (field, actual, expected) => {
  if (field === '_id' || expected instanceof mongoose.Types.ObjectId) {
    exports.assertId(actual, expected);
  } else if (field === '__v') {
    should(actual).instanceOf(Number);
  } else if (field === 'createdAt') {
    should(actual).instanceOf(Date);
  } else if (field === 'updatedAt') {
    should(actual).instanceOf(Date);
  } else if (expected instanceof RegExp) {
    should(actual).match(expected);
  } else if (expected === '_mock_') {
    should(actual).be.ok();
  } else {
    exports.assert(actual, expected);
  }
};

let _assertIfExpectedIsNil = (actual, expected) => {
  if (!_.isNil(expected)) {
    return false;
  }
  should(actual).not.be.ok();
  return true;
};

let _assertIfExpectedIsArray = (actual, expected) => {
  if (!_.isArray(expected)) {
    return false;
  }
  should(actual).have.ownProperty('length');
  should(actual.length).be.greaterThanOrEqual(expected.length);
  for (let i = 0; i < expected.length; i++) {
    exports.assert(actual[i], expected[i]);
  }
  return true;
};

let _assertIfExpectedIsSimplePrim = (actual, expected) => {
  if (!exports.isSimplePrim(expected)) {
    return false;
  }
  should(actual).equal(expected);
  return true;
};
