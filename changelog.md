# <sub>v6.0.0</sub>
#### _Jan. 24, 2020_
  * Drop support for Node v6.
  * Update dependencies.

# <sub>v5.0.2</sub>
#### _Apr. 5, 2019_
  * Remove mongoose methods. To generate and validate ObjectId, bson package has been installed.
  * Method `assertCollection` moved to a new package [mongo-assert](https://github.com/AlexanderMac/mongo-assert).
  * Remove `processError` method.
  * Remove `resolveOrReject` method.
  * Rename `validateCalledFn` method to `assertFn`, change `srvc` parameter to `inst`.
  * Update dependencies.

# <sub>v4.0.0</sub>
#### _Nov. 15, 2018_
  * Remove `sinon` dependency, now it should be passed via `nassert.initSinon` method.

# <sub>v3.1.0</sub>
#### _Aug. 4, 2018_
  * Add `getObjectIdStr` method, that returns `mongoose.ObjectId` in string format.
  * Add ability to use `validateCalledFn` method to assert multiple calls. Add `callCount` and `nCall` parameters.

# <sub>v3.0.0</sub>
#### _Jan. 27, 2018_
  * Update sinon to v4.x.
  * Update mocha to v5.x, mongoose to v5.x, should to v13.x.
  * Remove unused Istanbul dependecy.

# <sub>v2.2.0</sub>
#### _Jan. 6, 2018_
  * Add `validateCalledFn` method to validate that stubbed function is called or not, and if called then with provided arguments.

# <sub>v2.1.0</sub>
#### _Oct. 2, 2017_
  * Add `isEqual` parameter to `assert` method to perform a deep assertion between two values to determine if they are equivalent.
  * Add logic for converting `actual` mongoose documents array to plain objects.

# <sub>v2.0.0</sub>
#### _Sep. 1, 2017_
  * Delete deprecated methods: `getList`, `getSingleById`, `sinonMatch`, `buildQuery`, `processErrorNoMessage`.
  * Some methods now are private: `assertId`, `isSimplePrim`.
  * Remove `getObjectIdStr` method.
  * Add `assertCollection` method. 
  * Add `safeToString` method to safety convert value to string.
  * Add parameter validations in `assertCollection` method.
  * Improve `assert` method algorithm, decreased the number of recursive calls.
  * AssertionError now contains `at path` part (contains the wrong value full path).
  * Fix bug in `assert` method for the case when an array of objects is asserting.
  * Fix a few bugs in assertions.
  * Update dependencies.

# <sub>v1.1.0</sub>
#### _Aug. 20, 2017_
  * Cover codebase by tests with code coverage ~99%.

# <sub>v1.0.0</sub>
#### _Aug. 19, 2017_
  * Release a stable version.
  * A few major changes in used dev-tools (eslint instead of jshint, add mocha for test and istanbul for code coverage).
 
# <sub>v0.1.0</sub>
#### _Jun. 8, 2017_
  * Revert sinon from v2 to v1.

# <sub>v0.0.1</sub>
#### _Jun. 8, 2017_
  * First release.
