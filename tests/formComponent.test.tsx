import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from '../src/Form'
import Input from '../src/Inputs/Input'
import { Submit } from '../src'
import { router } from '@inertiajs/react'
import { before, get } from 'lodash'

const initialData = {
	user: {
		username: 'some name',
	},
	person: {
		first_name: 'first',
		last_name: 'last',
		middle_name: undefined,
		nested: {
			key: 'value',
		},
	},
	contact: {
		phones: [
			{ number: '1234567890' },
			{ number: '2234567890' },
			{ number: '3234567890' },
		],
	},
}

/**
	 * Rails Attributes `false` tests
	 */
describe('With railsAttributes false', () => {
	render(
		<Form role="form" to="/form" data={ { ...initialData } }>
			<Input name="user.username" />
		</Form>,
	)

	const input = screen.getByRole('textbox')

	it('renders a form with values in inputs', () => {

		expect(input).toHaveValue(initialData.user.username)
	})

	it('updates form data with user input', () => {
		// render(
		// 	<Form role="form" to="/form" data={ { ...initialData } } model="person">
		// 		<Input name="nested.key" />
		// 	</Form>,
		// )

		// const input = screen.getByRole('textbox')

		fireEvent.change(input, { target: { value: 'modified form data' } })
		expect(input).toHaveValue('modified form data')
	})

})

/**
	 * Rails Attributes `true` tests
	 */
describe('With railsAttributes true', () => {
	render(
		<Form role="form" to="/form" data={ { ...initialData } } railsAttributes={ true }>
			<Input name="user.username" />
		</Form>,
	)

	const input = screen.getByRole('textbox')

	it('renders a form with values in inputs', () => {

		expect(input).toHaveValue(initialData.user.username)
	})

	it('rewrites nested attributes', () => {
		// render(
		// 	<Form role="form" to="/form"
		// 		data={ { ...initialData } }
		// 		model="person"
		// 		railsAttributes={ true }
		// 		// onChange={ form => console.log({ here: true, data: form.data.person }) }
		// 	>
		// 		<Input name="nested.key" />
		// 	</Form>,
		// )

		// const input = screen.getByRole('textbox')

		expect(input).toHaveAttribute('name', 'person.nested_attributes.key')
		expect(input).toHaveValue(initialData.person.nested.key)
	})
})

/*
describe('Inputs', () => {




	it('updates values with rails attributes naming', () => {
		render(
			<Form to="/form" data={ initialData } model="person" railsAttributes={ true }>
				<Input name="nested.key" />
			</Form>,
		)

		const input = screen.getByRole('textbox')

		fireEvent.change(input, { target: { value: 'rails attributes' } })
		expect(input).toHaveValue('rails attributes')
	})
})
/*
describe('Form submitting', () => {

	it('sends the correct data to the server upon form submit', async () => {
		const mockRequest = jest.spyOn(router, 'visit').mockImplementation((route, request) => {
			const data = request?.data
			// console.log({ data })
			const value = get(data, 'person.nested_attributes.key')
			// console.log({ value })
			// expect(get(data, 'person.nested_attributes.key')).toBe('value')
			return Promise.resolve({ data: request?.data })
		})

		render(<Form model="person" to="/form" data={ initialData } railsAttributes>
			<Input name="first_name" />
			<Input name="nested.key" />
			<Submit>Submit</Submit>
		</Form>)

		const button = screen.getByRole('button')
		await fireEvent.click(button)

		expect(mockRequest).toHaveBeenCalled()
	})
})

*/
