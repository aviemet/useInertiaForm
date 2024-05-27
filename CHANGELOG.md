# [4.2.0](https://github.com/aviemet/useInertiaForm/compare/v4.1.0...v4.2.0) (2024-05-27)


### Bug Fixes

* 🐛 Fixes potential circular object ([128bb0c](https://github.com/aviemet/useInertiaForm/commit/128bb0cc56357fd43c0fd6973f2370a165c13aae))
* 🐛 Updates types ([cf1c777](https://github.com/aviemet/useInertiaForm/commit/cf1c77747ba0ae2594b3991d6238bfa67e568f8d))


### Features

* 🎸 Builds data object from useInertiaInput ([fa74815](https://github.com/aviemet/useInertiaForm/commit/fa7481559d3b69ffda4e2167f6945f6492b98658))

# [4.1.0](https://github.com/aviemet/useInertiaForm/compare/v4.0.0...v4.1.0) (2024-05-23)


### Features

* **useinertiainput:** exports UseInertiaInputProps ([6e63ef2](https://github.com/aviemet/useInertiaForm/commit/6e63ef279ea864ece3ca74c658e375ca94d94e41))

# [4.0.0](https://github.com/aviemet/useInertiaForm/compare/v3.7.0...v4.0.0) (2024-05-21)


### Features

* 🎸 Clears errors on an input when the value changes ([aaca443](https://github.com/aviemet/useInertiaForm/commit/aaca443a7a3b05b9988af7a698f353ba5f51883c))
* 🎸 Updates tests ([28da649](https://github.com/aviemet/useInertiaForm/commit/28da6493c74b603488f2c4abf470d0c3a97b7dee))


### BREAKING CHANGES

* 🧨 Clears errors by default on value change. Must pass
`clearErrorsOnChange: false` to `useInertiaInput` to disable behavior

# [4.0.0](https://github.com/aviemet/useInertiaForm/compare/v3.7.0...v4.0.0) (2024-05-21)


### Features

* 🎸 Clears errors on an input when the value changes ([aaca443](https://github.com/aviemet/useInertiaForm/commit/aaca443a7a3b05b9988af7a698f353ba5f51883c))


### BREAKING CHANGES

* 🧨 Clears errors by default on value change. Must pass
`clearErrorsOnChange: false` to `useInertiaInput` to disable behavior

# [3.7.0](https://github.com/aviemet/useInertiaForm/compare/v3.6.0...v3.7.0) (2024-05-03)


### Features

* **input:** makes Input more extensible ([406e6c6](https://github.com/aviemet/useInertiaForm/commit/406e6c69947b90347d70854f293ba652339e987f))

# [3.6.0](https://github.com/aviemet/useInertiaForm/compare/v3.5.0...v3.6.0) (2024-05-02)


### Features

* **usedynamicinputs:** adds support for a plain object override ([08698f5](https://github.com/aviemet/useInertiaForm/commit/08698f50e91dd6150f423aa42906d43431fabb4d))

# [3.5.0](https://github.com/aviemet/useInertiaForm/compare/v3.4.0...v3.5.0) (2024-04-29)


### Features

* **usedynamicinputs:** adds override option to addInput ([91979ce](https://github.com/aviemet/useInertiaForm/commit/91979ce232d6b5619ceb814146173df5a22eca07))

# [3.4.0](https://github.com/aviemet/useInertiaForm/compare/v3.3.3...v3.4.0) (2024-04-14)


### Features

* removeInput returns the removed record ([#16](https://github.com/aviemet/useInertiaForm/issues/16)) ([b4ac146](https://github.com/aviemet/useInertiaForm/commit/b4ac146d8e543a4a631c541afda53c9ca65b97ef))

## [3.3.3](https://github.com/aviemet/useInertiaForm/compare/v3.3.2...v3.3.3) (2024-02-01)


### Bug Fixes

* 🐛 Remove memoization of returned methods ([9198d6b](https://github.com/aviemet/useInertiaForm/commit/9198d6b32d023b37fea31a3ce042de75d745ede5))

## [3.3.2](https://github.com/aviemet/useInertiaForm/compare/v3.3.1...v3.3.2) (2023-12-16)


### Bug Fixes

* 🐛 Changes default form data type to NestedObject ([c7690f9](https://github.com/aviemet/useInertiaForm/commit/c7690f91fb659f74407a0773f54b4c029c650d88))

## [3.3.1](https://github.com/aviemet/useInertiaForm/compare/v3.3.0...v3.3.1) (2023-12-16)


### Bug Fixes

* 🐛 Adds second generic to useInertiaInput type definition ([bcf3d39](https://github.com/aviemet/useInertiaForm/commit/bcf3d39079c571b05aed6303c3670d80dfa63c9b))

# [3.3.0](https://github.com/aviemet/useInertiaForm/compare/v3.2.1...v3.3.0) (2023-08-19)


### Features

* 🎸 Force release for breaking change in rollup export ([e87c4cc](https://github.com/aviemet/useInertiaForm/commit/e87c4cc1692f1755295d37d8e44c88e273e69266))

## [3.2.1](https://github.com/aviemet/useInertiaForm/compare/v3.2.0...v3.2.1) (2023-06-12)


### Bug Fixes

* 🐛 Replaces isEmpty with isUnset for detecting empty inputs ([886b0de](https://github.com/aviemet/useInertiaForm/commit/886b0dec62022bdc9d87617418f19d66383bab21))

# [3.2.0](https://github.com/aviemet/useInertiaForm/compare/v3.1.5...v3.2.0) (2023-06-10)


### Features

* 🎸 Adds optional requiredFields prop to Submit button ([#8](https://github.com/aviemet/useInertiaForm/issues/8)) ([b064ef3](https://github.com/aviemet/useInertiaForm/commit/b064ef3420b1185f5787afb2eee821b706a83144))

## [3.1.5](https://github.com/aviemet/useInertiaForm/compare/v3.1.4...v3.1.5) (2023-06-09)


### Bug Fixes

* 🐛 Makes `to` a required prop ([#7](https://github.com/aviemet/useInertiaForm/issues/7)) ([0822d5c](https://github.com/aviemet/useInertiaForm/commit/0822d5c7720a7b8d0d45b4325e017eaada424895))

## [3.1.4](https://github.com/aviemet/useInertiaForm/compare/v3.1.3...v3.1.4) (2023-04-18)


### Bug Fixes

* 🐛 Fixes type for clearErrors ([7751649](https://github.com/aviemet/useInertiaForm/commit/775164926dbad769e067fdb9ea056ad7f40698c8))

## [3.1.3](https://github.com/aviemet/useInertiaForm/compare/v3.1.2...v3.1.3) (2023-04-10)


### Bug Fixes

* 🐛 Removes Required modifier from Form definitions ([3933d8d](https://github.com/aviemet/useInertiaForm/commit/3933d8d2f0e9cc22cf033bee447dc24f834df6a6))

## [3.1.2](https://github.com/aviemet/useInertiaForm/compare/v3.1.1...v3.1.2) (2023-04-08)


### Bug Fixes

* 🐛 Adds path typings to clearErrors ([834d2d2](https://github.com/aviemet/useInertiaForm/commit/834d2d2127cb28b5859332751b499d427a7ca524))

## [3.1.1](https://github.com/aviemet/useInertiaForm/compare/v3.1.0...v3.1.1) (2023-04-08)


### Bug Fixes

* 🐛 Removes undefined option for data return value ([29a48e3](https://github.com/aviemet/useInertiaForm/commit/29a48e32279a40dc6fccdd35c84b11f135bafacf))

# [3.1.0](https://github.com/aviemet/useInertiaForm/compare/v3.0.2...v3.1.0) (2023-04-05)


### Features

* 🎸 Adds the filter prop ([5331b2b](https://github.com/aviemet/useInertiaForm/commit/5331b2bd189240450114fb588d2181e6ac30a525))

## [3.0.2](https://github.com/aviemet/useInertiaForm/compare/v3.0.1...v3.0.2) (2023-03-31)


### Bug Fixes

* 🐛 Clears errors upon form reset ([ac7cabf](https://github.com/aviemet/useInertiaForm/commit/ac7cabf29e5c71bbdc6b8083d4f3975ae81a823f))

## [3.0.1](https://github.com/aviemet/useInertiaForm/compare/v3.0.0...v3.0.1) (2023-03-30)


### Bug Fixes

* 🐛 Rewrites error keys from server responses ([2a719e9](https://github.com/aviemet/useInertiaForm/commit/2a719e902e437f528ad6ae0c0802465e4b493e55))

# [3.0.0](https://github.com/aviemet/useInertiaForm/compare/v2.3.0...v3.0.0) (2023-03-29)


### Features

* 🎸 Renames onBeforeChange to onChange ([91152b2](https://github.com/aviemet/useInertiaForm/commit/91152b2c71672ef4611353de22a133a4aa1a7607))


### BREAKING CHANGES

* 🧨 onChange

# [2.3.0](https://github.com/aviemet/useInertiaForm/compare/v2.2.0...v2.3.0) (2023-03-29)


### Features

* 🎸 Adds type inference to getters and setters ([c6b4c35](https://github.com/aviemet/useInertiaForm/commit/c6b4c3532b9b4a793d6412b3d4c0d2c322ef2c81))

# [2.2.0](https://github.com/aviemet/useInertiaForm/compare/v2.1.0...v2.2.0) (2023-03-27)


### Features

* 🎸 Adds onChange ([5f1f54f](https://github.com/aviemet/useInertiaForm/commit/5f1f54f7c1ce0bbf1d1bcc349f794e9bc65e84a4))

# [2.1.0](https://github.com/aviemet/useInertiaForm/compare/v2.0.15...v2.1.0) (2023-03-26)


### Features

* 🎸 Adds useDynamicInputs hook ([0c81eb1](https://github.com/aviemet/useInertiaForm/commit/0c81eb1320b21f7cb04948bfe1ffec6fed16752a))

## [2.0.15](https://github.com/aviemet/useInertiaForm/compare/v2.0.14...v2.0.15) (2023-03-25)


### Bug Fixes

* 🐛 Exports DynamicInputsProps ([07c669d](https://github.com/aviemet/useInertiaForm/commit/07c669d1677626b549f2fab1c99086cce8b6767a))

## [2.0.14](https://github.com/aviemet/useInertiaForm/compare/v2.0.13...v2.0.14) (2023-03-25)


### Bug Fixes

* 🐛 Properly scopes model attribute in DynamicInputs ([35fb5ff](https://github.com/aviemet/useInertiaForm/commit/35fb5ffcfddad83e24d2c338195249777d7736a9))

## [2.0.13](https://github.com/aviemet/useInertiaForm/compare/v2.0.12...v2.0.13) (2023-03-24)


### Bug Fixes

* 🐛 Removes disabled conditions from Submit button ([403270a](https://github.com/aviemet/useInertiaForm/commit/403270a3e6ee48e74c9703722df2d396762b5bb8))

## [2.0.12](https://github.com/aviemet/useInertiaForm/compare/v2.0.11...v2.0.12) (2023-03-24)


### Bug Fixes

* 🐛 Only resets form data after success if async ([3f970c7](https://github.com/aviemet/useInertiaForm/commit/3f970c704d4e0b438e5836b4a550c551e4ffd85a))

## [2.0.11](https://github.com/aviemet/useInertiaForm/compare/v2.0.10...v2.0.11) (2023-03-24)


### Bug Fixes

* 🐛 Adds errors to dependency array in Form component ([f342147](https://github.com/aviemet/useInertiaForm/commit/f342147b10a29ab1ee1e0e7067d5ed0c33d21b02))

## [2.0.10](https://github.com/aviemet/useInertiaForm/compare/v2.0.9...v2.0.10) (2023-03-24)


### Bug Fixes

* 🐛 Refactors Form component to eliminate a file ([89e370f](https://github.com/aviemet/useInertiaForm/commit/89e370f2081ce85d214151592c0ae215a0980075))

## [2.0.9](https://github.com/aviemet/useInertiaForm/compare/v2.0.8...v2.0.9) (2023-03-23)


### Bug Fixes

* 🐛 Nested arrays properly renamed, errors properly set ([e2629d9](https://github.com/aviemet/useInertiaForm/commit/e2629d90a315260161ea55efa712d72375d001a6))

## [2.0.8](https://github.com/aviemet/useInertiaForm/compare/v2.0.7...v2.0.8) (2023-03-23)


### Bug Fixes

* 🐛 Includes array access notation in attributes rewrite ([d7dbb59](https://github.com/aviemet/useInertiaForm/commit/d7dbb59e5716b6e6a8acd5d070a7dd4b6a1b0f87))

## [2.0.7](https://github.com/aviemet/useInertiaForm/compare/v2.0.6...v2.0.7) (2023-03-22)


### Bug Fixes

* 🐛 Fixes fillEmptyValues to include nested arrays ([4089f82](https://github.com/aviemet/useInertiaForm/commit/4089f828cb87e8a03fe09487b5a7d0fcc7a5662b))

## [2.0.6](https://github.com/aviemet/useInertiaForm/compare/v2.0.5...v2.0.6) (2023-03-22)


### Bug Fixes

* 🐛 Fixes unsetData ([21749d9](https://github.com/aviemet/useInertiaForm/commit/21749d93cf6004ab640f1ce865149bd8fdeb9ce9))

## [2.0.5](https://github.com/aviemet/useInertiaForm/compare/v2.0.4...v2.0.5) (2023-03-21)


### Bug Fixes

* 🐛 Fixes incorrect inertia router import and setData memo ([b2b48d9](https://github.com/aviemet/useInertiaForm/commit/b2b48d9457eb6cb89026ce20b4e323c49fe37891))

## [2.0.4](https://github.com/aviemet/useInertiaForm/compare/v2.0.3...v2.0.4) (2023-03-20)


### Bug Fixes

* 🐛 Improves typing, memoizes useForm return values ([05a3237](https://github.com/aviemet/useInertiaForm/commit/05a3237272d325f015a320192d1374127cfcb11b))

## [2.0.3](https://github.com/aviemet/useInertiaForm/compare/v2.0.2...v2.0.3) (2023-03-18)


### Bug Fixes

* 🐛 Fixes useInertiaForm callbacks and adds tests ([6b408b7](https://github.com/aviemet/useInertiaForm/commit/6b408b750056df878a77508866757bcb3bcda741))

## [2.0.2](https://github.com/aviemet/useInertiaForm/compare/v2.0.1...v2.0.2) (2023-03-17)


### Bug Fixes

* 🐛 Fixes reset and clearErrors ([539b39c](https://github.com/aviemet/useInertiaForm/commit/539b39ceb33d8d2bd37da3fd613d48ff17e994e8))

## [2.0.1](https://github.com/aviemet/useInertiaForm/compare/v2.0.0...v2.0.1) (2023-03-17)


### Bug Fixes

* 🐛 Allows `transform` method to work ([b31c5ce](https://github.com/aviemet/useInertiaForm/commit/b31c5ce8bfda40dc07e8375b87d67ef23accfdbf))

# [2.0.0](https://github.com/aviemet/useInertiaForm/compare/v1.0.7...v2.0.0) (2023-03-16)


### Features

* 🎸 Fixes rails attributes implementation ([19e61d8](https://github.com/aviemet/useInertiaForm/commit/19e61d8e7e54010e7c94402d0e746ef08b6384e2))


### BREAKING CHANGES

* 🧨 <Form />

## [1.0.7](https://github.com/aviemet/useInertiaForm/compare/v1.0.6...v1.0.7) (2023-03-14)


### Bug Fixes

* 🐛 Replaces lodash.cloneDeep with js native structuredClone ([347f226](https://github.com/aviemet/useInertiaForm/commit/347f22616f8912033eb8d340b845c5e1992c6648))

## [1.0.6](https://github.com/aviemet/useInertiaForm/compare/v1.0.5...v1.0.6) (2023-03-14)


### Bug Fixes

* 🐛 Minor updates to cause release ([4f581ba](https://github.com/aviemet/useInertiaForm/commit/4f581ba801af0c509779e58f60637914bd0cad27))

## [1.0.5](https://github.com/aviemet/useInertiaForm/compare/v1.0.4...v1.0.5) (2023-02-24)


### Bug Fixes

* 🐛 Classname was omitted from form definition ([139d3b1](https://github.com/aviemet/useInertiaForm/commit/139d3b1e3875941d9ec7345fb77e843acde21ce6))

## [1.0.4](https://github.com/aviemet/useInertiaForm/compare/v1.0.3...v1.0.4) (2023-02-24)


### Bug Fixes

* 🐛 Moves rollup plugin to dev dependencies ([6e819f1](https://github.com/aviemet/useInertiaForm/commit/6e819f1efa89df187fc3892894e379402fba2a76))

## [1.0.3](https://github.com/aviemet/useInertiaForm/compare/v1.0.2...v1.0.3) (2023-02-24)


### Bug Fixes

* 🐛 Fixes typings ([4ebc54a](https://github.com/aviemet/useInertiaForm/commit/4ebc54a24e3bfc9dfac74b5a0a36689cb696625b))

## [1.0.2](https://github.com/aviemet/useInertiaForm/compare/v1.0.1...v1.0.2) (2023-02-24)


### Bug Fixes

* 🐛 Adds generic typings for useInertiaInput ([e9f2536](https://github.com/aviemet/useInertiaForm/commit/e9f2536ac27ff32e59265ac28a5e87408b278ac4))

## [1.0.1](https://github.com/aviemet/useInertiaForm/compare/v1.0.0...v1.0.1) (2023-02-22)


### Bug Fixes

* 🐛 Removes old README section ([d9b6ecc](https://github.com/aviemet/useInertiaForm/commit/d9b6ecc50bda0e8e146b7477d15be9152fd09beb))

# 1.0.0 (2023-02-22)


### Features

* 🎸 Alpha version bump ([7ba1317](https://github.com/aviemet/useInertiaForm/commit/7ba1317dd39bc1ce7bb83034311f2af71c1bdf67))
