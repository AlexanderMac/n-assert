'use strict';

const _        = require('lodash');
const mongoose = require('mongoose');
const should   = require('should');

let _sinon;
exports.getObjectId = mongoose.Types.ObjectId;
exports.getObjectIdStr = exports.getObjectId().toString();

exports.initSinon = (sinon) => _sinon = sinon;

/* eslint max-statements: off */
exports.assert = (actual, expected, isEqual) => {
  if (_assertIfExpectedIsNil(actual, expected) ||
      _assertIfExpectedIsSimplePrim(actual, expected) ||
      _assertIfExpectedIsArrayOfSimplePrim(actual, expected)
  ) {
    return;
  }

  actual = _convertMongooseDocsToPlainObjects(actual);

  let expectedPaths = _getObjectPaths(expected);
  if (isEqual) {
    let actualPaths = _getObjectPaths(actual);
    actualPaths = _.sortBy(actualPaths);
    expectedPaths = _.sortBy(expectedPaths);
    should(actualPaths).eql(expectedPaths);
  }

  let path;
  try {
    for (let i = 0; i < expectedPaths.length; i++) {
      path = expectedPaths[i];
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

exports.assertCollection = ({ model, initialDocs, changedDoc, typeOfChange, sortField }) => {
  if (!model) {
    throw new Error('<model> is undefined');
  }
  if (!_.isFunction(model.find)) {
    throw new Error('<model> is not mongoose model');
  }
  if (!_.isArray(initialDocs)) {
    throw new Error('<initialDocs> is undefined or not an array of documents');
  }
  if (typeOfChange) {
    if (!_.includes(['created', 'updated', 'deleted'], typeOfChange)) {
      throw new Error('Unknown <typeOfChange>');
    }
    if (!changedDoc) {
      throw new Error('<changedDoc> must be defined, when <typeOfChange> is defined');
    }
  }

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
  return _sinon.match(actual => {
    try {
      exports.assert(actual, expected);
      return true;
    } catch (err) {
      let newErr = new Error('sinon.match AssertionError: ' + err.message);
      throw newErr;
    }
  });
};

exports.validateCalledFn = ({ srvc, fnName, callCount = 1, nCall = 0, expectedArgs, expectedMultipleArgs }) => {
  let assertion;

  if (!expectedArgs && !expectedMultipleArgs) {
    assertion = srvc[fnName].called;
    should(assertion).equal(false, `Expected that ${fnName} wouldn't be called`);
    return;
  }

  assertion = srvc[fnName].callCount;
  let calledMessage = callCount === 1 ? 'once' : `${callCount} times`;
  should(assertion).equal(callCount, `Expected that ${fnName} called ${calledMessage}`);

  if (expectedArgs === '_without-args_') {
    assertion = srvc[fnName].getCall(nCall).calledWithExactly();
    should(assertion).equal(true, `Expected that ${fnName} called without args`);
  } else if (expectedMultipleArgs) {
    assertion = srvc[fnName].getCall(nCall).calledWithExactly(...expectedMultipleArgs);
    should(assertion).equal(true, `Expected that ${fnName} called with multiple args`);
  } else {
    let assertion = srvc[fnName].getCall(nCall).calledWithExactly(exports.sinonMatch(expectedArgs));
    should(assertion).equal(true, `Expected that ${fnName} called with single arg`);
  }
};

function _isSimplePrim(prim) {
  return _.isBoolean(prim) ||
         _.isNumber(prim) ||
         _.isString(prim) ||
         _.isDate(prim) ||
         _.isSymbol(prim) ||
         _.isRegExp(prim);
}

function _convertMongooseDocsToPlainObjects(actual) {
  if (actual instanceof mongoose.Document) {
    return actual.toObject();
  }

  if (_.isArray(actual)) {
    return _.map(actual, item => {
      if (item instanceof mongoose.Document) {
        return item.toObject();
      }
      return item;
    });
  }

  return actual;
}

function _assert(field, actual, expected) {
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
}

function _assertObjectId(actual, expected) {
  if (expected === '_mock_') {
    should(_safeToString(actual)).match(/^[a-z|\d]{24}$/);
  } else {
    should(_safeToString(actual)).equal(_safeToString(expected));
  }
}

function _assertIfExpectedIsNil(actual, expected) {
  if (!_.isNil(expected)) {
    return false;
  }
  should(actual).not.be.ok();
  return true;
}

function _assertIfExpectedIsArrayOfSimplePrim(actual, expected) {
  if (!_.isArray(expected) || !_.every(expected, _isSimplePrim)) {
    return false;
  }
  should(actual).eql(expected);
}

function _assertIfExpectedIsSimplePrim(actual, expected) {
  if (!_isSimplePrim(expected)) {
    return false;
  }
  should(actual).eql(expected);
  return true;
}

function _safeToString(val) {
  return _.isNil(val) ? val : val.toString();
}

function _getObjectPaths(item, curPath = '', isArray = false) {
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
}

function _getActualField(path) {
  let fields = path.split('.');
  return _.last(fields);
}
