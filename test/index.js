'use strict';

const _        = require('lodash');
const mongoose = require('mongoose');
const should   = require('should');
const sinon    = require('sinon');
const nassert  = require('../index');

mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  name: String,
  email: String
});

mongoose.model('user', UserSchema);
const User = mongoose.model('user');

describe('n-assert', () => {
  describe('assert', () => {
    function test(actual, expected, isEqual, expectedErr) {
      try {
        nassert.assert(actual, expected, isEqual);
        if (expectedErr) {
          throw new Error('Test must fail, because an error is expected');
        }
      } catch (err) {
        if (expectedErr instanceof Error) {
          should(err.message).eql(expectedErr.message);
        } else {
          throw err;
        }
      }
    }

    describe('actual is Mongoose document', () => {
      it('should convert a single actual Mongoose document to a plain object', () => {
        let actual = new User({
          name: 'John',
          email: 'john@mail.com'
        });
        let expected = {
          name: 'John',
          email: 'john@mail.com'
        };
        test(actual, expected);
      });

      it('should convert an array of actual Mongoose document to plain objects', () => {
        let actual = [
          new User({ name: 'John', email: 'john@mail.com' }),
          new User({ name: 'Donald', email: 'donald@mail.com' })
        ];
        let expected = [
          { name: 'John', email: 'john@mail.com' }
        ];
        test(actual, expected);
      });
    });

    describe('isEqual is passed', () => {
      it('should fail when isEqual is passed and expected not equal to actual', () => {
        let actual = [
          { name: 'John', email: 'john@mail.com' },
          { name: 'Donald', email: 'donald@mail.com' }
        ];
        let expected = [
          { name: 'John', email: 'john@mail.com' }
        ];
        /* eslint quotes: off */
        let expectedErr = new Error(`expected Array [ '0.email', '0.name', '1.email', '1.name' ] to equal Array [ '0.email', '0.name' ] (at length, A has 4 and B has 2)`);
        test(actual, expected, true, expectedErr);
      });

      it('should pass when isEqual is passed and expected equals to actual', () => {
        let actual = [
          { name: 'John', email: 'john@mail.com' },
          { name: 'Donald', email: 'donald@mail.com' }
        ];
        let expected = [
          { name: 'John', email: 'john@mail.com' },
          { name: 'Donald', email: 'donald@mail.com' }
        ];
        test(actual, expected, true);
      });
    });

    describe('expected is nil', () => {
      it('should fail assertion when actual is not undefined', () => {
        let actual = 1;
        let expected = undefined;
        let expectedErr = new Error('expected 1 not to be truthy (false negative fail)');
        test(actual, expected, undefined, expectedErr);
      });

      it('should pass assertion when actual is undefined and expected is null', () => {
        let actual = undefined;
        let expected = null;
        test(actual, expected);
      });

      it('should pass assertion when actual is undefined and expected is undefined', () => {
        let actual = undefined;
        let expected = undefined;
        test(actual, expected);
      });
    });

    describe('expected is an array of simple primitives', () => {
      it('should fail assertion when actual is not an array', () => {
        let actual = 1;
        let expected = [1, 2, 3];
        let expectedErr = new Error('expected 1 to equal Array [ 1, 2, 3 ]');
        test(actual, expected, undefined, expectedErr);
      });

      it('should fail assertion when actual is not equal to expected', () => {
        let actual = [1, 2, 3];
        let expected = [1, 'a', 3];
        let expectedErr = new Error('expected Array [ 1, 2, 3 ] to equal Array [ 1, \'a\', 3 ] (at \'1\', A has 2 and B has \'a\')');
        test(actual, expected, undefined, expectedErr);
      });

      it('should pass assertion when actual is equal to expected', () => {
        let actual = [1, 2, 3];
        let expected = [1, 2, 3];
        test(actual, expected);
      });
    });

    describe('expected is a simple primitive', () => {
      it('should fail assertion when actual is not simple primitive', () => {
        let actual = { name: 'John' };
        let expected = 5;
        let expectedErr = new Error('expected Object { name: \'John\' } to equal 5');
        test(actual, expected, undefined, expectedErr);
      });

      it('should fail assertion when actual is not equal to expected', () => {
        let actual = 1;
        let expected = 5;
        let expectedErr = new Error('expected 1 to equal 5');
        test(actual, expected, undefined, expectedErr);
      });

      it('should pass assertion when actual is equal to expected', () => {
        let actual = 5;
        let expected = 5;
        test(actual, expected);
      });
    });

    describe('expected is a complex object', () => {
      let getDefActual = (ex) => {
        let def = {
          _id: nassert.getObjectId(),
          __v: 2,
          createdAt: new Date(2017, 15, 20),
          updatedAt: new Date(2017, 15, 21),
          name: 'John Smith'
        };
        return _.extend(def, ex);
      };

      it('should pass assertion when actual is equal to expected with <string>_id', () => {
        let objId = nassert.getObjectId();
        let actual = getDefActual({ _id: objId });
        let expected = {
          _id: objId.toString()
        };
        test(actual, expected);
      });

      it('should pass assertion when actual is equal to expected with <ObjectId>_id', () => {
        let objId = nassert.getObjectId();
        let actual = getDefActual({ _id: objId });
        let expected = {
          _id: objId
        };
        test(actual, expected);
      });

      it('should pass assertion when actual is equal to expected with <_mock_>_id', () => {
        let objId = nassert.getObjectId();
        let actual = getDefActual({ _id: objId });
        let expected = {
          _id: '_mock_'
        };
        test(actual, expected);
      });

      it('should pass assertion when actual is equal to expected with regexp field', () => {
        let objId = nassert.getObjectId();
        let actual = getDefActual({ _id: objId });
        let expected = {
          name: /^John/
        };
        test(actual, expected);
      });

      it('should pass assertion when actual is equal to expected with _mock_ field', () => {
        let objId = nassert.getObjectId();
        let actual = getDefActual({ _id: objId });
        let expected = {
          name: '_mock_'
        };
        test(actual, expected);
      });

      it('should pass assertion when actual is equal to expected', () => {
        let objId = nassert.getObjectId();
        let actual = getDefActual({ _id: objId });
        let expected = {
          _id: objId,
          __v: 'v',          // can be any value
          createdAt: 'date', // can be any value
          updatedAt: 'date', // can be any value,
          name: 'John Smith'
        };
        test(actual, expected);
      });

      it('should pass assertion when actual is equal to expected (case with nested objects and arrays)', () => {
        let objId = nassert.getObjectId();
        let actual = {
          _id: objId,
          __v: 2,
          createdAt: new Date(2017, 12, 20),
          updatedAt: new Date(2017, 12, 21),
          name: 'John Smith',
          phones: [
            { type: 'mobile', number: 12345 },
            { type: 'work', number: 67890 }
          ],
          account: {
            accountNumber: '111111',
            created: new Date(2010, 11, 15)
          }
        };
        let expected = {
          _id: objId.toString(),
          __v: 'v',          // can be any value
          createdAt: 'date', // can be any value
          updatedAt: 'date', // can be any value,
          name: 'John Smith',
          phones: [
            { type: 'mobile', number: '_mock_' }
          ],
          account: {
            accountNumber: '111111',
            created: '_mock_'
          }
        };
        test(actual, expected);
      });
    });
  });

  describe('assertResponse', () => {
    function test(res, expectedStatus, expectedBody, expectedErr) {
      try {
        nassert.assertResponse(res, expectedStatus, expectedBody);
        if (expectedErr) {
          throw new Error('Test must fail, because an error is expected');
        }
      } catch (err) {
        if (expectedErr instanceof Error) {
          should(err.message).eql(expectedErr.message);
        } else {
          throw err;
        }
      }
    }

    it('should fail assertion when expectedStatus is 204 and res.headers.content-type is not undefined', () => {
      let res = {
        headers: { 'content-type': 'application/json' },
        body: {}
      };
      let expectedStatus = 204;
      let expectedBody = undefined;
      let expectedErr = new Error('expected \'application/json\' to be undefined');
      test(res, expectedStatus, expectedBody, expectedErr);
    });

    it('should fail assertion when expectedStatus is 204 and res.body is not undefined', () => {
      let res = {
        headers: {},
        body: { userId: 1 }
      };
      let expectedStatus = 204;
      let expectedBody = undefined;
      let expectedErr = new Error('expected Object { userId: 1 } to be empty');
      test(res, expectedStatus, expectedBody, expectedErr);
    });

    it('should pass assertion when expectedStatus is 204 and res.headers.content-type and res.body are empty', () => {
      let res = {
        headers: {},
        body: {}
      };
      let expectedStatus = 204;
      let expectedBody = undefined;
      test(res, expectedStatus, expectedBody);
    });

    it('should fail assertion when expectedStatus is not 204 and res.headers.content-type is not application/json', () => {
      let res = {
        headers: { 'content-type': 'application/xml' },
        body: { userId: 1 }
      };
      let expectedStatus = 201;
      let expectedBody = { userId: 1 };
      let expectedErr = new Error('expected \'application/xml\' to match /application\\/json/');
      test(res, expectedStatus, expectedBody, expectedErr);
    });

    it('should fail assertion when expectedStatus is not 204 and res.body is not equal ro expectedBody', () => {
      let res = {
        headers: { 'content-type': 'application/json' },
        body: { userId: 1 }
      };
      let expectedStatus = 201;
      let expectedBody = { userId: 2 };
      let expectedErr = new Error('expected 1 to equal 2 at path userId');
      test(res, expectedStatus, expectedBody, expectedErr);
    });

    it('should pass assertion when expectedStatus is not 204 and res.body is equal to expectedBody', () => {
      let res = {
        headers: { 'content-type': 'application/json' },
        body: { userId: 1 }
      };
      let expectedStatus = 201;
      let expectedBody = { userId: 1 };
      test(res, expectedStatus, expectedBody);
    });
  });

  describe('assertCollection', () => {
    let initialUsers = [
      { _id: nassert.getObjectId(), name: 'John', email: 'john@mail.com' },
      { _id: nassert.getObjectId(), name: 'Ted', email: 'ted@mail.com' },
      { _id: nassert.getObjectId(), name: 'Matt', email: 'matt@mail.com' }
    ];

    function test(model, initialDocs, changedUser, typeOfChange, sortField = 'name') {
      return nassert.assertCollection({
        model,
        initialDocs,
        changedDoc: changedUser,
        typeOfChange,
        sortField
      });
    }

    before(() => {
      const MONGODB_URL = 'mongodb://localhost/nassert';
      return mongoose.connection.openUri(MONGODB_URL);
    });

    beforeEach(() => User.create(initialUsers));

    afterEach(() => User.remove());

    after(() => mongoose.connection.close());

    it('should throw an error when model is undefined', () => {
      let changedUser = { name: 'Max', email: 'max@mail.com' };
      let expectedError = new Error('<model> is undefined');
      return User
        .create(changedUser)
        .then(() => test(undefined, initialUsers, changedUser, 'created'))
        .catch(err => should(err).eql(expectedError));
    });

    it('should throw an error when model is not mongoose model', () => {
      let changedUser = { name: 'Max', email: 'max@mail.com' };
      let expectedError = new Error('<model> is not mongoose model');
      return User
        .create(changedUser)
        .then(() => test({}, initialUsers, changedUser, 'created'))
        .catch(err => should(err).eql(expectedError));
    });

    it('should throw an error when intialCollection is not an array', () => {
      let changedUser = { name: 'Max', email: 'max@mail.com' };
      let expectedError = new Error('<initialDocs> is undefined or not an array of documents');
      return User
        .create(changedUser)
        .then(() => test(User, initialUsers[0], changedUser, 'created'))
        .catch(err => should(err).eql(expectedError));
    });

    it('should throw an error when typeOfChange has invalid value', () => {
      let changedUser = { name: 'Max', email: 'max@mail.com' };
      let expectedError = new Error('Unknown <typeOfChange>');
      return User
        .create(changedUser)
        .then(() => test(User, initialUsers, changedUser, 'wrong type'))
        .catch(err => should(err).eql(expectedError));
    });

    it('should throw an error when typeOfChange is defined, but changedDoc not', () => {
      let changedUser = { name: 'Max', email: 'max@mail.com' };
      let expectedError = new Error('<changedDoc> must be defined, when <typeOfChange> is defined');
      return User
        .create(changedUser)
        .then(() => test(User, initialUsers, undefined, 'created'))
        .catch(err => should(err).eql(expectedError));
    });

    it('should pass assertion when no one document is changed', () => {
      return test(User, initialUsers);
    });

    it('should pass assertion when no one document is changed', () => {
      return test(User, initialUsers);
    });

    it('should pass assertion when a new document is added and sortField is null', () => {
      let changedUser = { name: 'Max', email: 'max@mail.com' };
      return User
        .create(changedUser)
        .then(() => test(User, initialUsers, changedUser, 'created', null));
    });

    it('should pass assertion when an existing document is updated', () => {
      let changedUser = { _id: initialUsers[1]._id, name: 'Roy', email: 'roy@mail.com' };
      return User
        .findById(changedUser._id)
        .then(user => {
          _.extend(user, changedUser);
          return user.save();
        })
        .then(() => test(User, initialUsers, changedUser, 'updated'));
    });

    it('should pass assertion when an existing document is deleted', () => {
      let changedUser = { _id: initialUsers[2]._id.toString() };
      return User
        .findById(changedUser._id)
        .then(user => user.remove())
        .then(() => test(User, initialUsers, changedUser, 'deleted'));
    });
  });

  describe('processError', () => {
    function test(actual, expected, expectedCalledWith) {
      let done = sinon.spy();

      nassert.processError(actual, expected, done);
      should(done.calledOnce).be.true();
      if (!expectedCalledWith) {
        should(done.calledWithExactly()).be.true();
      } else {
        should(done.calledWith(sinon.match((actual => {
          return actual.message === expectedCalledWith.message;
        })))).be.true();
      }
    }

    it('should call done with an error when expected is not an error', () => {
      let actual = new Error('err1');
      let expected = true;
      let expectedCalledWith = actual;
      test(actual, expected, expectedCalledWith);
    });

    it('should call done with an error when actual and expected are errors but not equal', () => {
      let actual = new Error('err1');
      let expected = new Error('err2');
      let expectedCalledWith = new Error('expected Error { message: \'err1\' } to \
equal Error { message: \'err2\' } (at message, A has \'err1\' and B has \'err2\')');
      test(actual, expected, expectedCalledWith);
    });

    it('should call done without params when expected is an error and actual is equal to expected', () => {
      let actual = new Error('err1');
      let expected = new Error('err1');
      let expectedCalledWith = undefined;
      test(actual, expected, expectedCalledWith);
    });
  });

  describe('resolveOrReject', () => {
    function test(err, expectResolveIsCalled) {
      let resolve = sinon.spy();
      let reject = sinon.spy();

      nassert.resolveOrReject(err, resolve, reject);
      if (expectResolveIsCalled) {
        should(resolve.calledOnce).be.true();
      } else {
        should(reject.calledOnce).be.true();
      }
    }

    it('should call resolve when err is undefined', () => {
      let err = undefined;
      let expectResolveIsCalled = true;
      test(err, expectResolveIsCalled);
    });

    it('should call reject when err is not undefined', () => {
      let err = new Error();
      let expectResolveIsCalled = false;
      test(err, expectResolveIsCalled);
    });
  });

  describe('sinonMatch', () => {
    function test(actualVal, expectedVal, expectedRes) {
      let match = nassert.sinonMatch(expectedVal);
      try {
        let actualRes = match.test(actualVal);
        should(actualRes).eql(expectedRes);
      } catch (err) {
        if (expectedRes instanceof Error) {
          should(err.message).eql(expectedRes.message);
        } else {
          throw err;
        }
      }
    }

    it('should call sinon.match and throw error when assertion is failed', () => {
      let actualVal = 5;
      let expectedVal = 10;
      let expectedRes = new Error('sinon.match AssertionError: expected 5 to equal 10');
      test(actualVal, expectedVal, expectedRes);
    });

    it('should call sinon.match and return true when assertion is passed', () => {
      let actualVal = 10;
      let expectedVal = 10;
      let expectedRes = true;
      test(actualVal, expectedVal, expectedRes);
    });
  });

  describe('validateCalledFn', () => {
    let _srvc = {
      doWork: () => {}
    };

    beforeEach(() => {
      sinon.stub(_srvc, 'doWork');
    });

    afterEach(() => {
      _srvc.doWork.restore();
    });

    function test({ params, expected }) {
      if (_.isError(expected)) {
        should(nassert.validateCalledFn.bind(nassert, params)).throw(expected.message);
      } else {
        nassert.validateCalledFn(params);
      }
    }

    function getDefaultParams(ex) {
      let params = {
        srvc: _srvc,
        fnName: 'doWork'
      };
      return _.extend(params, ex);
    }

    it('should throw error when service method called, but expectedArgs and expectedMultipleArgs are not provided', () => {
      let params = getDefaultParams();
      let expected = new Error('Expected that doWork wouldn\'t be called');

      _srvc.doWork();

      test({ params, expected });
    });

    it('should throw error when service method called once, but callCount is 2', () => {
      let params = getDefaultParams({ callCount: 2, expectedArgs: 'p1' });
      let expected = new Error('Expected that doWork called 2 times');

      _srvc.doWork();

      test({ params, expected });
    });

    it('should throw error when service method doesn\'t called, but expectedArgs is provided', () => {
      let params = getDefaultParams({ expectedArgs: 'p1' });
      let expected = new Error('Expected that doWork called once');

      test({ params, expected });
    });

    it('should throw error when service method doesn\'t called, but callCount is 2', () => {
      let params = getDefaultParams({ callCount: 2, expectedArgs: 'p1' });
      let expected = new Error('Expected that doWork called 2 times');

      test({ params, expected });
    });

    it('should throw error when service method called twice and expectedArgs is provided', () => {
      let params = getDefaultParams({ expectedArgs: 'p1' });
      let expected = new Error('Expected that doWork called once');

      _srvc.doWork('p1');
      _srvc.doWork('p1');

      test({ params, expected });
    });

    it('should throw error when service method called with one arg, but expectedArgs is `_without-args_`', () => {
      let params = getDefaultParams({ expectedArgs: '_without-args_' });
      let expected = new Error('Expected that doWork called without args');

      _srvc.doWork('p1');

      test({ params, expected });
    });

    it('should throw error when service method called with [p1, p3], but expectedMultipleArgs is [p1, p2]', () => {
      let params = getDefaultParams({ expectedMultipleArgs: ['p1', 'p2'] });
      let expected = new Error('Expected that doWork called with multiple args');

      _srvc.doWork('p1', 'p3');

      test({ params, expected });
    });

    it('should throw error when service method called with p1, but expectedArgs is p2', () => {
      let params = getDefaultParams({ expectedArgs: 'p2' });
      let expected = new Error(`sinon.match AssertionError: expected 'p1' to equal 'p2'`);

      _srvc.doWork('p1');

      test({ params, expected });
    });

    it('shouldn\'t throw error when service method doesn\'t called and expectedArgs, expectedMultipleArgs are not provided', () => {
      let params = getDefaultParams();

      test({ params, expected: null });
    });

    it('shouldn\'t throw error when service method called without args and expectedArgs is `_without-args_`', () => {
      let params = getDefaultParams({ expectedArgs: '_without-args_' });

      _srvc.doWork();

      test({ params, expected: null });
    });

    it('shouldn\'t throw error when service method called with [p1, p2] and expectedMultipleArgs is [p1, p2]', () => {
      let params = getDefaultParams({ expectedMultipleArgs: ['p1', 'p2'] });

      _srvc.doWork('p1', 'p2');

      test({ params, expected: null });
    });

    it('shouldn\'t throw error when service method called with p1 and expectedArgs is p1', () => {
      let params = getDefaultParams({ expectedArgs: 'p1' });

      _srvc.doWork('p1');

      test({ params, expected: null });
    });
  });
});
