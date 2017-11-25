# n-assert
Node.js assertion helper library.

[![Build Status](https://travis-ci.org/AlexanderMac/n-assert.svg?branch=master)](https://travis-ci.org/AlexanderMac/n-assert)
[![npm version](https://badge.fury.io/js/n-assert.svg)](https://badge.fury.io/js/n-assert)

### Why
This library is created to assert complex objects.

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
# Run tests
$ npm run tests
# Run linter
$ npm run lint
# Run coverage tool
$ npm run coverage
```

### Usage
```js
let nassert = require('n-assert');

should('should find user by name', => {
  let actual = usersSrvc.getUserByName('John');
  let expected = { ... };

  nassert.assert(actual, expected);
})
```

### API
- **assert(actual, expected, isEqual)**<br>
Asserts if `actual` is equal to `expected`.

  - `actual` - actual object, can be null|undefined.
  - `expected` - expected object, can be null|undefined.
  - `isEqual` - if passed, performs a deep assertion between two values to determine if they are equivalent. 

- **assertResponse(res, expectedStatus, expectedBody)**<br>
Asserts if status and body in `res` is equal to `expectedStatus` and `expectedBody`.

  - `res` - http response.
  - `expectedStatus` - expected http response status.
  - `expectedBody` - expected http response body.

- **assertCollection({ model, initialDocs, changedDoc, typeOfChange, sortField })**<br>
Asserts mongodb collection. Loads all collection documents, updates an initial collection with changed document and asserts.

  - `model` - mongoose model.
  - `initialDocs` - initial documents collection.
  - `changedDoc` - changed document, must be omitted or undefined if collection is unchanged.
  - `typeOfChange` - the type of the change (_created_, _updated_, _deleted_), must be omitted if collection is unchanged.
  - `sortField` - the field which should be used for sorting actual and expected collections before asseting.

- **processError(actual, expected, done)**<br>
Asserts if `actual` is error object and is equal to `expected`.

  - `actual` - actual error object.
  - `expected` - expected error object.
  - `done` - mocha callback, is called with error when `actual` is not equal to `expected`, otherwise without parameters.

- **resolveOrReject(err, resolve, reject)**<br>
Calls `reject` if `err` is not null or undefined, otherwise `resolve`.

  - `err` - error object, can be null|undefined.
  - `resolve` - callback, is called when `err` is not null or undefined.
  - `reject` - callback, is called when `err` is undefined.

- **sinonMatch(expected)**<br>
Calls sinon.match and compares `actual` value with `expected` using `nassert.assert`. Returns true if they are the same, otherwiser throws an error.

- **getObjectId()**<br>
Returns new mongodb ObjectId.

### Author
Alexander Mac

### License
Licensed under the MIT license.
