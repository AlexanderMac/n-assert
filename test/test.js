'use strict';

let should  = require('should');
let nassert = require('../index');

describe('test', () => {
  it('should', () => {
    nassert.getObjectId();
    should(10).equal(10);
  });
});
