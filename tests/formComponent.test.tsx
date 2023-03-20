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

describe('Form Component', () => {
	/**
	 * Rails Attributes `false` tests
	 */
	describe('With railsAttributes false', () => {
		it('renders a form with values in inputs', () => {
			render(
				<Form role="form" to="/form" data={ { ...initialData } } remember={ false }>
					<Input name="user.username" />
				</Form>,
			)

			const input = screen.getByRole('textbox')

			expect(input).toHaveValue(initialData.user.username)
		})

		it('updates form data with user input', () => {
			render(
				<Form role="form" to="/form" data={ { ...initialData } } model="person" remember={ false }>
					<Input name="nested.key" />
				</Form>,
			)

			const input = screen.getByRole('textbox')

			fireEvent.change(input, { target: { value: 'modified form data' } })
			expect(input).toHaveValue('modified form data')
		})

		it('sends the correct data to the server upon form submit', async () => {
			const mockRequest = jest.spyOn(router, 'visit').mockImplementation((route, request) => {
				const data = request?.data
				expect(get(data, 'person.nested.key')).toBe('value')
				return Promise.resolve({ data: request?.data })
			})

			render(
				<Form model="person" to="/form" data={ initialData } remember={ false }>
					<Input name="first_name" />
					<Input name="nested.key" />
					<Submit>Submit</Submit>
				</Form>,
			)

			const button = screen.getByRole('button')
			await fireEvent.click(button)

			expect(mockRequest).toHaveBeenCalled()
		})
	})

	/**
	 * Rails Attributes `true` tests
	 */
	describe('With railsAttributes true', () => {
		it('renders a form with values in inputs', () => {
			render(
				<Form role="form" to="/form" data={ { ...initialData } } railsAttributes={ true }  remember={ false }>
					<Input name="user.username" />
				</Form>,
			)

			const input = screen.getByRole('textbox')
			expect(input).toHaveValue(initialData.user.username)
		})

		it('updates values as normal', () => {
			render(
				<Form to="/form" data={ initialData } model="person" railsAttributes={ true } remember={ false }>
					<Input name="nested.key" />
				</Form>,
			)

			const input = screen.getByRole('textbox')

			fireEvent.change(input, { target: { value: 'rails attributes' } })
			expect(input).toHaveValue('rails attributes')
		})

		it('sends the correct data to the server upon form submit', async () => {
			const mockRequest = jest.spyOn(router, 'visit').mockImplementation((route, request) => {
				const data = request?.data

				expect(get(data, 'user.username')).toBe(initialData.user.username)
				expect(get(data, 'person.nested_attributes.key')).toBe(initialData.person.nested.key)
				expect(get(data, 'extra.value')).toBe('exists')

				return Promise.resolve({ data: request?.data })
			})

			const handleSubmit = (form) => {
				form.transform(data => ({ ...data, extra: { value: 'exists' } }))
			}

			render(
				<Form
					model="person"
					to="/form"
					data={ initialData }
					railsAttributes
					remember={ false }
					onSubmit={ handleSubmit }
				>
					<Input name="first_name" />
					<Input name="nested.key" />
					<Submit>Submit</Submit>
				</Form>,
			)

			const button = screen.getByRole('button')
			await fireEvent.click(button)

			expect(mockRequest).toHaveBeenCalled()
		})

	})
})
