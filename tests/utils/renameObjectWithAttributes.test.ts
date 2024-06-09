import { renameObjectWithAttributes } from '../../src/utils'

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
