import { coerceArray } from '../../src/utils'

describe('coerceArray', () => {
	it('should return an array regardless of input', () => {
		const nonArray = 'hello'
		const array = ['one', 'two', 'three']
		const coerced1 = coerceArray(nonArray)
		const coerced2 = coerceArray(array)

		expect(coerced1).toEqual([nonArray])
		expect(coerced2).toEqual(array)
	})
})
