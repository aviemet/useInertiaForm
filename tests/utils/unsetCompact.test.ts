import { NestedObject } from '../../src/useInertiaForm'
import { unsetCompact } from '../../src/utils'

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

	it('should delete by array index, filtering out empty array elements', () => {
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
		it('unsets all instances of a key', () => {
			const data = structuredClone(nestedData)

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
			const data = structuredClone(nestedData)

			unsetCompact(data, 'two.four[].ten[].twelve')
			expect(data).toEqual({
				one: 'one',
				two: {
					three: 'three',
					four: [
						{ five: 'five', six: 'six' },
						{ seven: 'seven' },
						{ five: 'eight', six: 'nine', ten: [
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
			const data = structuredClone(nestedData)

			unsetCompact(data, 'two.four[].ten[1].eleven')
			expect(data).toEqual({
				one: 'one',
				two: {
					three: 'three',
					four: [
						{ five: 'five', six: 'six' },
						{ seven: 'seven' },
						{ five: 'eight', six: 'nine', ten: [
							{ eleven: 'eleven', twelve: 'twelve' },
							{ thirteen: 'thirteen' },
						] },
					],
					last: {
						just: 'testing',
					},
				},
			})
		})

		it('works when an empty bracket is specified after an element ', () => {
			const data = structuredClone(nestedData)

			unsetCompact(data, 'two.four[2].ten[].eleven')
			expect(data).toEqual({
				one: 'one',
				two: {
					three: 'three',
					four: [
						{ five: 'five', six: 'six' },
						{ seven: 'seven' },
						{ five: 'eight', six: 'nine', ten: [
							{ twelve: 'twelve' },
							{ thirteen: 'thirteen' },
						] },
					],
					last: {
						just: 'testing',
					},
				},
			})

		})
	})
})
