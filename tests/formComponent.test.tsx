import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import Form from '../src/Form'
import Input from '../src/Inputs/Input'

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

const setup = (name: string, model?: string) => {
	const form = render(<Form model={ model } to="/form" data={ initialData }>
		<Input name={ name } />
	</Form>)

	const input = screen.getByRole('textbox')

	return { input, ...form }
}

describe('Form', () => {
	it('renders a form with values in inputs', () => {
		const { input } = setup('user.username')

		expect(input).toHaveValue(initialData.user.username)
	})

	it('rewrites nested attributes', () => {
		const { input } = setup('nested.key', 'person')

		expect(input).toHaveAttribute('name', 'person.nested_attributes.key')
		expect(input).toHaveValue(initialData.person.nested.key)
	})

	it('updates form data with user input', () => {
		const { input } = setup('nested.key', 'person')

		fireEvent.change(input, { target: { value: 'new value' } })
		expect(input).toHaveValue('new value')
	})

	it('updates values with rails attributes naming', () => {
		const { input } = setup('nested.key', 'person')

		fireEvent.change(input, { target: { value: 'new value' } })
		expect(input).toHaveValue('new value')
	})
})
