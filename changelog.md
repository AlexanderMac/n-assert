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
