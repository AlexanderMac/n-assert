'use strict';

let _       = require('lodash');
let should  = require('should');
let sinon   = require('sinon');
let nassert = require('../index');

describe('n-assert', () => {
  describe('assert', () => {
    let test = (actual, expected, expectedErr) => {
      try {
        nassert.assert(actual, expected);
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
    };

    describe('expected is nil', () => {
      it('should fail assertion when actual is not undefined', () => {
        let actual = 1;
        let expected = undefined;
        let expectedErr = new Error('expected 1 not to be truthy (false negative fail)');
        test(actual, expected, expectedErr);
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
        let expectedErr = new Error('expected 1 to have own property length');
        test(actual, expected, expectedErr);
      });

      it('should fail assertion when actual is not equal to expected', () => {
        let actual = [1, 2, 3];
        let expected = [1, 'a', 3];
        let expectedErr = new Error('expected 2 to equal \'a\'');
        test(actual, expected, expectedErr);
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
        test(actual, expected, expectedErr);
      });

      it('should fail assertion when actual is not equal to expected', () => {
        let actual = 1;
        let expected = 5;
        let expectedErr = new Error('expected 1 to equal 5');
        test(actual, expected, expectedErr);
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
    let test = (res, expectedStatus, expectedBody, expectedErr) => {
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
    };

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
      let expectedErr = new Error('expected 1 to equal 2');
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

  describe('processError', () => {
    let test = (actual, expected, expectedCalledWith) => {
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
    };

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
    let test = (err, expectResolveIsCalled) => {
      let resolve = sinon.spy();
      let reject = sinon.spy();

      nassert.resolveOrReject(err, resolve, reject);
      if (expectResolveIsCalled) {
        should(resolve.calledOnce).be.true();
      } else {
        should(reject.calledOnce).be.true();
      }
    };

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
    let test = (actualVal, expectedVal, expectedRes) => {
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
    };

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
});
