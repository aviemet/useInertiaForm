import { stripAttributes } from '../../src/utils'

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
