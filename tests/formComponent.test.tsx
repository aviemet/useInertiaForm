import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form, useForm } from '../src/Form'
import Input from '../src/Inputs/Input'
import { DynamicInputs, Submit, useDynamicInputs } from '../src'
import { router } from '@inertiajs/react'
import { get } from 'lodash'
import { act } from '@testing-library/react-hooks'

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

		it('sends the correct data to the server upon form submit', () => {
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

		it('sends the correct data to the server upon form submit', () => {
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
			let form, inputs

			render(
				<Form to="/form" data={ initialData } model="contact" remember={ false }>
					<TestComponent />
				</Form>,
			)

			function TestComponent() {
				form = useForm<typeof initialData>()
				inputs = useDynamicInputs({
					model: 'phones',
					emptyData: { number: '' },
				})
				return null
			}

			act(() => {
				inputs.addInput()
				inputs.addInput({ number: '1' })
				inputs.addInput(records => {
					return ({
						number: `${parseInt(records[1].number) + 1}`,
					})
				})
			})

			const phones = form.getData('contact.phones')

			expect(phones).toContainEqual({ number: '' })
			expect(phones).toContainEqual({ number: '1' })
			expect(phones).toContainEqual({ number: '2234567891' })
		})

		it('removes inputs', () => {
			let form, inputs

			render(
				<Form to="/form" data={ initialData } model="contact" remember={ false }>
					<TestComponent />
				</Form>,
			)

			function TestComponent() {
				form = useForm<typeof initialData>()
				inputs = useDynamicInputs({
					model: 'phones',
					emptyData: { number: '' },
				})
				return null
			}

			let phones = form.getData('contact.phones')
			expect(phones.length).toEqual(3)

			act(() => {
				inputs.removeInput(1)
			})

			phones = form.getData('contact.phones')

			expect(phones.length).toEqual(2)
			expect(phones).not.toContainEqual({ number: '2234567890' })
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
