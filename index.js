'use strict';

let _        = require('lodash');
let mongoose = require('mongoose');
let should   = require('should');
let sinon    = require('sinon');

exports.getObjectId = mongoose.Types.ObjectId;

exports.getObjectIdStr = () => exports.getObjectId().toString();

exports.assert = (actual, expected) => {
  if (_assertIfExpectedIsNil(actual, expected) ||
      _assertIfExpectedIsSimplePrim(actual, expected) ||
      _assertIfExpectedIsArrayOfSimplePrim(actual, expected)
  ) {
    return;
  }

  if (actual instanceof mongoose.Document) {
    actual = actual.toObject();
  }

  let paths = _getObjectPaths(expected);
  let path;
  try {
    for (let i = 0; i < paths.length; i++) {
      path = paths[i];
      let field = _getActualField(path);
      let actualVal = _.get(actual, path);
      let expectedVal = _.get(expected, path);
      _assert(field, actualVal, expectedVal);
    }
  } catch (err) {
    let newErr = new Error(`${err.message} at path ${path}`);
    throw newErr;
  }
};

exports.assertResponse = (res, expectedStatus, expectedBody) => {
  if (expectedStatus === 204) {
    should(res.headers['content-type']).be.undefined();
    should(res.body).be.empty();
  } else {
    should(res.headers['content-type']).match(/application\/json/);
    exports.assert(res.body, expectedBody);
  }
};

exports.assertCollectionn = ({ model, initialDocs, changedDoc, typeOfChange, sortField }) => {
  let expectedDocs = _.cloneDeep(initialDocs);
  return model
    .find()
    .lean()
    .exec()
    .then(actualDocs => {
      switch (typeOfChange) {
        case 'created':
          expectedDocs.push(changedDoc);
          break;
        case 'updated':
          let t = _.find(expectedDocs, doc => _safeToString(doc._id) === _safeToString(changedDoc._id));
          _.extend(t, changedDoc);
          break;
        case 'deleted':
          _.remove(expectedDocs, doc => _safeToString(doc._id) === _safeToString(changedDoc._id));
          break;
      }

      if (sortField) {
        actualDocs = _.sortBy(actualDocs, sortField);
        expectedDocs = _.sortBy(expectedDocs, sortField);
      }

      exports.assert(actualDocs, expectedDocs);
      return null;
    });
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

exports.resolveOrReject = (err, resolve, reject) => {
  if (err) {
    reject(err);
  } else {
    resolve();
  }
};

exports.sinonMatch = (expected) => {
  return sinon.match(actual => {
    try {
      exports.assert(actual, expected);
      return true;
    } catch (err) {
      let newErr = new Error('sinon.match AssertionError: ' + err.message);
      throw newErr;
    }
  });
};

let _isSimplePrim = (prim) => {
  return _.isBoolean(prim) ||
         _.isNumber(prim) ||
         _.isString(prim) ||
         _.isDate(prim) ||
         _.isSymbol(prim) ||
         _.isRegExp(prim);
};

let _assert = (field, actual, expected) => {
  if (field === '_id' || expected instanceof mongoose.Types.ObjectId) {
    _assertObjectId(actual, expected);
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

let _assertObjectId = (actual, expected) => {
  if (expected === '_mock_') {
    should(_safeToString(actual)).match(/^[a-z|\d]{24}$/);
  } else {
    should(_safeToString(actual)).equal(_safeToString(expected));
  }
};

let _assertIfExpectedIsNil = (actual, expected) => {
  if (!_.isNil(expected)) {
    return false;
  }
  should(actual).not.be.ok();
  return true;
};

let _assertIfExpectedIsArrayOfSimplePrim = (actual, expected) => {
  if (!_.isArray(expected) || !_.every(expected, _isSimplePrim)) {
    return false;
  }
  should(actual).eql(expected);
};

let _assertIfExpectedIsSimplePrim = (actual, expected) => {
  if (!_isSimplePrim(expected)) {
    return false;
  }
  should(actual).eql(expected);
  return true;
};

let _safeToString = val => _.isNil(val) ? val : val.toString();

let _getObjectPaths = (item, curPath = '', isArray = false) => {
  let paths = [];
  _.each(item, (val, key) => {
    if (val instanceof mongoose.Types.ObjectId) {
      val = _safeToString(val);
    }
    let newPath = isArray ? `${curPath}[${key}]` : `${curPath}.${key}`;
    if (_isSimplePrim(val)) {
      paths.push(newPath);
    }
    if (_.isArray(val)) {
      paths = paths.concat(_getObjectPaths(val, newPath, true));
    } else if (_.isObject(val)) {
      paths = paths.concat(_getObjectPaths(val, newPath));
    }
  });
  if (!curPath) {
    paths = _.map(paths, path => _.trimStart(path, '.'));
  }
  return paths;
};

let _getActualField = (path) => {
  let fields = path.split('.');
  return _.last(fields);
};
