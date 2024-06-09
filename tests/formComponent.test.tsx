import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
	Form,
	Input,
	Submit,
} from '../src'
import { router } from '@inertiajs/react'
import { get } from 'lodash'
import ContextTest from './components/ContextTest'
import { multiRootData, singleRootData } from './components/data'


describe('Form Component', () => {
	describe('When not passed a data object', () => {
		it('builds the data object from inputs', () => {
			render(
				<Form role="form" to="/" remember={ false }>
					<Input name="user.username" />
					<Input name="user.firstName" />
					<Input name="user.lastName" />

					<ContextTest />
				</Form>,
			)

			expect(screen.getByTestId('data')).toHaveTextContent(
				'{"user":{"username":"","firstName":"","lastName":""}}',
			)
		})
	})

	describe('When passed a data object', () => {
		it('it uses the data values ignoring defaultValue', () => {
			render(
				<Form role="form" to="/" remember={ false } data={ {
					user: {
						username: 'username',
						firstName: 'Firsty',
						lastName: 'Lasty',
					},
				} }>
					<Input name="user.username" defaultValue="default1" />
					<Input name="user.firstName" defaultValue="default2" />
					<Input name="user.lastName" defaultValue="default3" />

					<ContextTest />
				</Form>,
			)

			expect(screen.getByTestId('data')).toHaveTextContent(
				'{"user":{"username":"username","firstName":"Firsty","lastName":"Lasty"}}',
			)
		})

		it('adds missing keys to the data object from inputs', () => {
			render(
				<Form role="form" to="/" remember={ false } data={ {
					user: {
						username: 'username',
						firstName: 'Firsty',
					},
				} }>
					<Input name="user.username" />
					<Input name="user.firstName" />
					<Input name="user.lastName" defaultValue="Lasty" />

					<ContextTest />
				</Form>,
			)

			expect(screen.getByTestId('data')).toHaveTextContent(
				'{"user":{"username":"username","firstName":"Firsty","lastName":"Lasty"}}',
			)
		})
	})

	/**
	 * Rails Attributes `false` tests
	 */
	describe('With railsAttributes false', () => {
		it('renders a form with values in inputs', () => {
			render(
				<Form role="form" to="/form" data={ { ...multiRootData } } remember={ false }>
					<Input name="user.username" />
				</Form>,
			)

			const input = screen.getByRole('textbox')

			expect(input).toHaveValue(multiRootData.user.username)
		})

		it('updates form data with user input', () => {
			render(
				<Form role="form" to="/form" data={ { ...singleRootData } } model="person" remember={ false }>
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
				<Form model="person" to="/form" data={ { ...singleRootData } } remember={ false }>
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
				<Form
					role="form"
					to="/form"
					data={ { ...multiRootData } }
					railsAttributes={ true }
					remember={ false }
				>
					<Input name="user.username" />
				</Form>,
			)

			const input = screen.getByRole('textbox')
			expect(input).toHaveValue(multiRootData.user.username)
		})

		it('updates values as normal', () => {
			render(
				<Form
					to="/form"
					data={ singleRootData }
					model="person"
					railsAttributes={ true }
					remember={ false }
				>
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

				expect(get(data, 'user.username')).toBe(multiRootData.user.username)
				expect(get(data, 'person.nested_attributes.key')).toBe(multiRootData.person.nested.key)
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
					data={ multiRootData }
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
					data={ multiRootData }
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
