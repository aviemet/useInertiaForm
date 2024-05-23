import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form, useForm } from '../src/Form'
import TestInput from './TestInput'


const ErrorContextTest = () => {
	const { errors, setError } = useForm()

	const handleClick = e => {
		e.preventDefault()
		setError('errors.name', 'Error')
	}

	return (
		<>
			<button onClick={ handleClick } role="button" aria-label="error" />
			<div data-testid="errors">{ JSON.stringify(errors) }</div>
		</>
	)
}

describe ('useInertiaInput', () => {
	describe('With defaultValue', () => {

		it('builds the data object from inputs', async () => {

			const ValuesContextTest = () => {
				const { data } = useForm()

				return <div data-testid="data">{ JSON.stringify(data) }</div>
			}

			await render(
				<Form role="form" to="/" model="values" remember={ false }>
					<TestInput name="name"  />
					<ValuesContextTest />
				</Form>,
			)

			const input = screen.getByRole('input')

			expect(screen.getByTestId('data')).toHaveTextContent('{"values":{"name":""}}')

			fireEvent.change(input, { target: { value: 'value' } })
			expect(screen.getByTestId('data')).toHaveTextContent('{"values":{"name":"value"}}')
		})
	})

	describe('With clearErrorsOnChange = true', () => {
		it('clears errors on an input when the value changes ', () => {
			render(
				<Form role="form" to="/" data={ { errors: { name: '' } } } model="errors" remember={ false }>
					<TestInput name="name"  />
					<ErrorContextTest />
				</Form>,
			)

			const errorButton = screen.getByRole('button', { name: 'error' })
			const input = screen.getByRole('input')

			fireEvent.click(errorButton)
			expect(screen.getByTestId('errors')).toHaveTextContent('{"errors.name":"Error"}')

			fireEvent.change(input, { target: { value: 'something' } })
			expect(screen.getByTestId('errors')).toHaveTextContent('{}')
		})

	})

	describe('With clearErrorsOnChange = false', () => {
		it('doesn\'t clear errors on an input when the value changes', () => {
			render(
				<Form role="form" to="/" data={ { errors: { name: '' } } } model="errors" remember={ false }>
					<TestInput name="name" clearErrorsOnChange={ false } />
					<ErrorContextTest />
				</Form>,
			)

			const errorButton = screen.getByRole('button', { name: 'error' })
			const input = screen.getByRole('input')

			fireEvent.click(errorButton)
			expect(screen.getByTestId('errors')).toHaveTextContent('{"errors.name":"Error"}')

			fireEvent.change(input, { target: { value: 'something' } })
			expect(screen.getByTestId('errors')).toHaveTextContent('{"errors.name":"Error"}')
		})

	})
})
