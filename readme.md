# n-assert
Node.js assertion library.

[![Build Status](https://travis-ci.org/AlexanderMac/n-assert.svg?branch=master)](https://travis-ci.org/AlexanderMac/n-assert)
[![Code Coverage](https://codecov.io/gh/AlexanderMac/n-assert/branch/master/graph/badge.svg)](https://codecov.io/gh/AlexanderMac/n-assert)
[![npm version](https://badge.fury.io/js/n-assert.svg)](https://badge.fury.io/js/n-assert)

### Why
This library is created to assert the complex objects.

```js
// Some test method returns this object
let actual = {
  _id: '5945bf36ccb3fa0011e8533c',
  name: 'John',
  email: 'john@mail.com',
  phones: [
    { type: 'mobile', number: '1234567' }
    { type: 'work', number: '567382' }
  ],
  account: {
    number: '11111',
    registered: '2010-04-21'
  },
  createdAt: '2017-02-03'
};

// Ned to do the following assertions:
//   _id is exists
//   name and email match
//   mobile phone is exists and it's a number
//   account registered match
let expected = {
  _id: '_mock_',
  name: 'John',
  email: 'john@mail.com',
  phones: [
    { type: 'mobile', number: /^d{1,10}$/ }
  ],
  account: {
    registered: '2010-04-21'
  }
}

nassert.assert(actual, expected);
```

### Commands
```bash
# Add to project
$ npm i -S n-assert
```

### Usage
```js
const nassert = require('n-assert');

should('should find user by name', async () => {
  let actual = await usersSrvc.getUserByName('John');
  let expected = { /* some data */ };

  nassert.assert(actual, expected);
})
```

### API
- **assert(actual, expected, isEqual)**<br>
Asserts that `actual` is equal to `expected`.

  - `actual` - actual object.
  - `expected` - expected object.
  - `isEqual` - performs a deep assertion between `actual` and `expected` to determine that they are indentical. 

- **assertResponse(res, expectedStatus, expectedBody)**<br>
Asserts that status and body in `res` is equal to `expectedStatus` and `expectedBody`.

  - `res` - http response.
  - `expectedStatus` - expected http response status.
  - `expectedBody` - expected http response body.

- **assertFn**<br>
Asserts that stubbed function has been called or not, and if called, then with provided arguments. **Warning!** To use `sinonMatch` function, sinon instance should be initialized via `nassert.initSinon(sinon)` method.

  - `inst` - object instance.
  - `fnName` - stubbed function name in the service.
  - `callCount` - count of function calles, one by default.
  - `nCall` - validates that method was called with provided args on that call, zero by default.
  - `expectedArgs` - expected _single_ argument, should be `__without-args__` if function is called without arguments.
  - `expectedMultipleArgs` - expected _few_ arguments.

- **sinonMatch(expected)**<br>
Calls sinon.match and compares `actual` value with `expected` using `nassert.assert`. Returns `true` if values identical, otherwise throws an error. **Warning!** To use `sinonMatch` function, sinon instance should be initialized via `nassert.initSinon(sinon)` method.

- **getObjectId()**<br>
Returns new mongodb ObjectId.

- **getObjectIdStr()**<br>
Returns new mongodb ObjectId in string format.

### Author
Alexander Mac

### License
Licensed under the MIT license.
