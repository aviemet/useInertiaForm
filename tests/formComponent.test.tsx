import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from '../src/Form'
import Input from '../src/Inputs/Input'
import { DynamicInputs, Submit, useDynamicInputs } from '../src'
import { router } from '@inertiajs/react'
import { get } from 'lodash'
import { act, renderHook } from '@testing-library/react-hooks'

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
			fireEvent.click(button)

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
			fireEvent.click(button)

			expect(mockRequest).toHaveBeenCalled()
		})

	})

	describe('DynamicInputs', () => {
		it('renders dynamic input fields', () => {
			render(
				<Form to="/form" data={ initialData } model="contact" remember={ false }>
					<DynamicInputs model="phones" emptyData={ { number: '' } }>
						<Input name="number" />
					</DynamicInputs>
				</Form>,
			)

			const buttons = screen.getAllByRole('button')

			expect(buttons.length).toBe(4)
		})

		it('adds inputs', () => {
			const formProviderWrapper = ({ children }) => (
				<Form to="/form" data={ initialData } model="contact" remember={ false }>
					{ children }
				</Form>
			)
			const { result } = renderHook(() => useDynamicInputs({
				model: 'phones',
				emptyData: { number: '' },
			}), { wrapper: formProviderWrapper })

			// phones: [
			// 	{ number: '1234567890' },
			// 	{ number: '2234567890' },
			// 	{ number: '3234567890' },
			// ],
			act(() => {
				result.current.addInput()
				result.current.addInput({ number: '1' })
				result.current.addInput(records => ({
					number: `${Number(records[0]) + 1}`,
				}))
			})

			// Need access to the form data context
		})
	})

	describe('Filter', () => {
		it('unsets data at the given paths', () => {
			const handleChange = (form) => {
				expect(form.data.person.last_name).toBeUndefined()
				expect(form.data.user.username).toBeUndefined()
				expect(form.data.person.first_name).toBeDefined()
			}

			render(
				<Form
					model="person"
					to="/form"
					data={ initialData }
					filter={ ['person.last_name', 'user.username'] }
					onChange={ handleChange }
				>
					<Input name="first_name" />
					<Submit>Submit</Submit>
				</Form>,
			)
		})
	})
})
