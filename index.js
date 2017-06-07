'use strict';

var _        = require('lodash');
var mongoose = require('mongoose');
var should   = require('should');
var sinon    = require('sinon');

exports.getObjectId = mongoose.Types.ObjectId;

exports.getList = (modelType, sortField, selectFields) => {
  var query = modelType.find({});
  if (sortField) {
    query.sort(sortField);
  }
  if (selectFields) {
    query.select(selectFields);
  }
  return query.exec();
};

exports.getSingleById = (modelType, id) => {
  return modelType.findById(id);
};

exports.assert = (actual, expected) => {
  var self = this;

  if (_assertIfExpectedIsUndefined(actual, expected) ||
    _assertIfExpectedIsArray(actual, expected) ||
    _assertIfExpectedIsSimplePrim(actual, expected)
  ) {
    return;
  }

  if (actual instanceof mongoose.Document) {
    actual = actual.toObject();
  }

  var expectedKeys = _.keys(expected);
  should(actual).have.properties(expectedKeys);

  _.each(expectedKeys, (key) => {
    var actualVal = actual[key];
    var expectedVal = expected[key];

    if (_.isArray(expectedVal)) {
      self.assert(actualVal, expectedVal);
      return;
    }

    _assert(key, actualVal, expectedVal);
  });
};

exports.sinonMatch = (expected) => {
  var self = this;
  return sinon.match(actual => {
    try {
      self.assert(actual, expected);
      return true;
    } catch (err) {
      return false;
    }
  });
};

exports.assertId = (actual, expected) => {
  if (expected === '_mock_') {
    should(actual.toString()).match(/^[a-z|\d]{24}$/);
  } else {
    should(actual.toString()).eql(expected.toString());
  }
};

exports.assertResponse = (res, expectedStatus, expectedBody) => {
  if (expectedStatus !== 203) {
    should(res.headers['content-type']).match(/application\/json/);
    exports.assert(res.body, expectedBody);
  } else {
    should(res.headers['content-type']).be.undefined;
    should(res.body).be.undefined;
  }
};

exports.isSimplePrim = (prim) => {
  return _.isBoolean(prim) ||
        _.isNumber(prim) ||
        _.isString(prim) ||
        _.isDate(prim);
};

exports.buildQuery = (params) => {
  var query = '';
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

var _assert = (key, actualVal, expectedVal) => {
  if (key === '_id' || expectedVal instanceof mongoose.Types.ObjectId) {
    exports.assertId(actualVal, expectedVal);
  } else if (key === '__v') {
    should(actualVal).instanceOf(Number);
  } else if (key === 'createdAt') {
    should(actualVal).instanceOf(Date);
  } else if (key === 'updatedAt') {
    should(actualVal).instanceOf(Date);
  } else if (expectedVal instanceof RegExp) {
    should(actualVal).match(expectedVal);
  } else if (expectedVal === '_mock_') {
    should(actualVal).be.ok;
  } else {
    exports.assert(actualVal, expectedVal);
  }
};

var _assertIfExpectedIsUndefined = (actual, expected) => {
  if (!expected) {
    should(actual).not.be.ok;
    return true;
  }
  return false;
};

var _assertIfExpectedIsArray = (actual, expected) => {
  if (_.isArray(expected)) {
    should(actual).have.length(expected.length);
    for (var i = 0; i < expected.length; i++) {
      exports.assert(actual[i], expected[i]);
    }
    return true;
  }
  return false;
};

var _assertIfExpectedIsSimplePrim = (actual, expected) => {
  if (exports.isSimplePrim(expected)) {
    should(actual).eql(expected);
    return true;
  }
  return false;
};
