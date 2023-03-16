import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from '../src/Form'
import Input from '../src/Inputs/Input'
import { Submit } from '../src'
import { router } from '@inertiajs/react'
import { get } from 'lodash'

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

const setup = ({ name, model, rails = false }: { name: string, model?: string, rails?: boolean }) => {
	const form = render(
		<Form model={ model } to="/form" data={ initialData } railsAttributes={ rails }>
			<Input name={ name } />
		</Form>,
	)

	const input = screen.getByRole('textbox')

	return { input, ...form }
}

describe('Inputs', () => {
	it('renders a form with values in inputs', () => {
		const { input } = setup({ name: 'user.username' })

		expect(input).toHaveValue(initialData.user.username)
	})

	it('rewrites nested attributes', () => {
		const { input } = setup({ name: 'nested.key', model: 'person', rails: true })

		expect(input).toHaveAttribute('name', 'person.nested_attributes.key')
		expect(input).toHaveValue(initialData.person.nested.key)
	})

	it('updates form data with user input', () => {
		const { input } = setup({ name: 'nested.key', model: 'person' })

		fireEvent.change(input, { target: { value: 'unmodified form data' } })
		expect(input).toHaveValue('unmodified form data')
	})

	it('updates values with rails attributes naming', () => {
		const { input } = setup({ name: 'nested.key', model: 'person' })

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
