import { NestedObject } from '../src/types'
import { coerceArray, fillEmptyValues, renameObjectWithAttributes, renameWithAttributes, stripAttributes, unsetCompact } from '../src/utils'

const nestedData: NestedObject = {
	one: 'one',
	two: {
		three: 'three',
		four: [
			{ five: 'five' },
			{ six: 'six' },
		],
		seven: {
			just: 'testing',
		},
	},
}

describe('unsetCompact', () => {
	it('should delete the value of a nested object using dot notation', () => {
		const data = structuredClone(nestedData)

		unsetCompact(data, 'one')
		unsetCompact(data, 'two.three')

		expect(data).toMatchObject({
			two: {
				four: [
					{ five: 'five' },
					{ six: 'six' },
				],
				seven: {
					just: 'testing',
				},
			},
		})
	})

	it('should reorder arrays making all elements sequential', () => {
		const data = structuredClone(nestedData)

		unsetCompact(data, 'two.four[0]')
		expect(data).toMatchObject({
			one: 'one',
			two: {
				three: 'three',
				four: [
					{ six: 'six' },
				],
				seven: {
					just: 'testing',
				},
			},
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

describe('renameWithAttributes', () => {
	it('should add _attributes where appropriate to dot notation strings', () => {
		expect(renameWithAttributes('user.person.name')).toEqual('user.person_attributes.name')
		expect(renameWithAttributes('user.contact.phones[2].number')).toEqual('user.contact_attributes.phones[2].number')
		expect(renameWithAttributes('user.person.manager.name')).toEqual('user.person_attributes.manager_attributes.name')
	})

	it('accepts another string to use in place of _attributes', () => {
		expect(renameWithAttributes('user.person.name', '_input')).toEqual('user.person_input.name')
	})
})

describe('stripAttributes', () => {
	it('should remove _attributes from dot notation strings', () => {
		const key = 'user.person.name'
		const attributed = renameWithAttributes('user.person.name')
		expect(stripAttributes(attributed)).toEqual(key)
	})

	it('should not remove the word attributes without the _ or not at the end of a segment', () => {
		const key1 = 'user.attributes'
		const key2 = 'user.manager_attributes_sorted'
		expect(stripAttributes(key1)).toEqual(key1)
		expect(stripAttributes(key2)).toEqual(key2)
	})
})

const mockFormData = {
	user: {
		id: 1,
		username: 'something',
		person: {
			id: 1,
			first_name: 'first',
		},
	},
	roles: [
		{ id: 1, name: 'admin' },
	],
}

describe('renameObjectWithAttributes', () => {
	it('should append attributes to keys deeper than the first level which contain another object', () => {
		const data = renameObjectWithAttributes(mockFormData)
		expect(data).toMatchObject({
			user: {
				id: 1,
				username: 'something',
				person_attributes: {
					id: 1,
					first_name: 'first',
				},
			},
			roles: [
				{ id: 1, name: 'admin' },
			],
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
