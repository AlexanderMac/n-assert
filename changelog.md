# <sub>v5.0.0</sub>
#### _Apr. 5, 2019_

  * Removed mongoose methods. To generate and validate ObjectId, bson package has been installed.
  * Method `assertCollection` moved to a new package [mongo-assert](https://github.com/AlexanderMac/mongo-assert).
  * Removed `processError` method.
  * Removed `resolveOrReject` method.
  * Method `validateCalledFn` renamed to `assertFn`, `srvc` parameter changed to `inst`.
  * All packages updated to the latest versions.

# <sub>v4.0.0</sub>
#### _Nov. 15, 2018_

  * Removed `sinon` dependency, now it should be passed via `nassert.initSinon` method.

# <sub>v3.1.0</sub>
#### _Aug. 4, 2018_

  * Added `getObjectIdStr` method, that returns `mongoose.ObjectId` in string format.
  * Added ability to use `validateCalledFn` method to assert multiple calls. Added `callCount` and `nCall` parameters.

# <sub>v3.0.0</sub>
#### _Jan. 27, 2018_

 * Sinon updated to v4.x.
 * Mocha updated to v5.x, mongoose to v5.x, should to v13.x.
 * Removed unused Istanbul dependecy.

# <sub>v2.2.0</sub>
#### _Jan. 6, 2018_

 * Added `validateCalledFn` method to validate that stubbed function is called or not, and if called then with provided arguments.
 
# <sub>v2.1.0</sub>
#### _Oct. 2, 2017_

 * Added `isEqual` parameter to `assert` method to perform a deep assertion between two values to determine if they are equivalent.
 * Added logic for converting `actual` mongoose documents array to plain objects.

# <sub>v2.0.0</sub>
#### _Sep. 1, 2017_

 * Deleted deprecated methods: `getList`, `getSingleById`, `sinonMatch`, `buildQuery`, `processErrorNoMessage`.
 * Some methods now are private: `assertId`, `isSimplePrim`.
 * Removed `getObjectIdStr` method.
 * Added `assertCollection` method. 
 * Added `safeToString` method to safety convert value to string.
 * Added parameter validations in `assertCollection` method.
 * Improved `assert` method algorithm, decreased the number of recursive calls.
 * AssertionError now contains `at path` part (contains the wrong value full path).
 * Fixed bug in `assert` method for the case when an array of objects is asserting.
 * Fixed a few bugs in assertions.
 * The used packages updated to the latest versions.

# <sub>v1.1.0</sub>
#### _Aug. 20, 2017_

 * All code covered by tests with code coverage ~99%.
 
# <sub>v1.0.0</sub>
#### _Aug. 19, 2017_

 * Released a stable version.
 * A few major changes in used dev-tools (eslint instead of jshint, added mocha for test and istanbul for code coverage).
 
# <sub>v0.1.0</sub>
#### _Jun. 8, 2017_

 * `sinon` reverted from v2 to v1.

# <sub>v0.0.1</sub>
#### _Jun. 8, 2017_

 * Initial release.
