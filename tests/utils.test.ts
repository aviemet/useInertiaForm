import { NestedObject } from '../src/useInertiaForm'
import { coerceArray, fillEmptyValues, renameObjectWithAttributes, stripAttributes, unsetCompact } from '../src/utils'

const nestedData: NestedObject = {
	one: 'one',
	two: {
		three: 'three',
		four: [
			{ five: 'five', six: 'six' },
			{ seven: 'seven' },
			{ five: 'eight', six: 'nine', ten: [
				{ eleven: 'eleven', twelve: 'twelve' },
				{ eleven: 'eleven', thirteen: 'thirteen' },
			] },
		],
		last: {
			just: 'testing',
		},
	},
}

describe('unsetCompact', () => {
	it('should delete the value of a nested object using dot notation', () => {
		const data = structuredClone(nestedData)

		unsetCompact(data, 'one')
		unsetCompact(data, 'two.three')

		expect(data).toEqual({
			two: {
				four: [
					{ five: 'five', six: 'six' },
					{ seven: 'seven' },
					{ five: 'eight', six: 'nine', ten: [
						{ eleven: 'eleven', twelve: 'twelve' },
						{ eleven: 'eleven', thirteen: 'thirteen' },
					] },
				],
				last: {
					just: 'testing',
				},
			},
		})
	})

	it('should reorder arrays making all elements sequential and removing empty array elements', () => {
		const data = structuredClone(nestedData)

		unsetCompact(data, 'two.four[0]')
		unsetCompact(data, 'two.four[1].ten[0]')

		expect(data).toEqual({
			one: 'one',
			two: {
				three: 'three',
				four: [
					{ seven: 'seven' },
					{ five: 'eight', six: 'nine', ten: [
						{ eleven: 'eleven', thirteen: 'thirteen' },
					] },
				],
				last: {
					just: 'testing',
				},
			},
		})
	})

	describe('recursively unsets array elements by key with empty array brackets', () => {
		const data = structuredClone(nestedData)

		it('unsets all instances of a key', () => {
			unsetCompact(data, 'two.four[].five')
			expect(data).toEqual({
				one: 'one',
				two: {
					three: 'three',
					four: [
						{ six: 'six' },
						{ seven: 'seven' },
						{ six: 'nine', ten: [
							{ eleven: 'eleven', twelve: 'twelve' },
							{ eleven: 'eleven', thirteen: 'thirteen' },
						] },
					],
					last: {
						just: 'testing',
					},
				},
			})
		})

		it('works with nested array objects', () => {
			unsetCompact(data, 'two.four[].ten[].twelve')
			expect(data).toEqual({
				one: 'one',
				two: {
					three: 'three',
					four: [
						{ six: 'six' },
						{ seven: 'seven' },
						{ six: 'nine', ten: [
							{ eleven: 'eleven' },
							{ eleven: 'eleven', thirteen: 'thirteen' },
						] },
					],
					last: {
						just: 'testing',
					},
				},
			})
		})

		it('works when an element is specified after an empty bracket', () => {
			unsetCompact(data, 'two.four[].ten[1].thirteen')
			expect(data).toEqual({
				one: 'one',
				two: {
					three: 'three',
					four: [
						{ six: 'six' },
						{ seven: 'seven' },
						{ six: 'nine', ten: [
							{ eleven: 'eleven' },
							{ eleven: 'eleven' },
						] },
					],
					last: {
						just: 'testing',
					},
				},
			})
		})

		it('works when an empty bracket is specified after an element ', () => {
			unsetCompact(data, 'two.four[2].ten[].eleven')
			expect(data).toEqual({
				one: 'one',
				two: {
					three: 'three',
					four: [
						{ six: 'six' },
						{ seven: 'seven' },
						{ six: 'nine', ten: [] },
					],
					last: {
						just: 'testing',
					},
				},
			})

		})
	})
})

describe('fillEmptyValues', () => {
	it('should replace undefined or null values with empty strings', () => {
		const sanitized = fillEmptyValues({
			one: 'one',
			two: undefined,
			three: null,
			nested: {
				four: undefined,
				five: null,
			},
		})

		expect(sanitized).toMatchObject({
			one: 'one',
			two: '',
			three: '',
			nested: {
				four: '',
				five: '',
			},
		})
	})
})

describe('stripAttributes', () => {
	it('should remove _attributes from dot notation strings', () => {
		const key = 'user.person_attributes.name'
		expect(stripAttributes(key)).toEqual('user.person.name')
	})

	it('should not remove the word attributes without the _ or not at the end of a segment', () => {
		const key1 = 'user.attributes'
		const key2 = 'user.manager_attributes_sorted'
		expect(stripAttributes(key1)).toEqual(key1)
		expect(stripAttributes(key2)).toEqual(key2)
	})
})

const mockFormData = {
	person: {
		first_name: 'Something',
		user: {
			username: 'something',
		},
		contact: {
			emails: [
				{ email: 'something@email.com' },
			],
		},
	},
}

describe('renameObjectWithAttributes', () => {
	it('should append attributes to keys deeper than the first level which contain another object', () => {
		const data = renameObjectWithAttributes(mockFormData)

		expect(data).toMatchObject({
			person: {
				first_name: 'Something',
				user_attributes: {
					username: 'something',
				},
				contact_attributes: {
					emails_attributes: [
						{ email: 'something@email.com' },
					],
				},
			},
		})
	})
})

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
