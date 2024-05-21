import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form, useForm } from '../src/Form'
import TestInput from './TestInput'

const FormContextTest = () => {
	const { errors, setError } = useForm()

	const handleClick = e => {
		e.preventDefault()
		setError('name', 'Error')
	}

	return (
		<>
			<button onClick={ handleClick } role="button" aria-label="error" />
			<div data-testid="errors">{ JSON.stringify(errors) }</div>
		</>
	)
}

describe ('useInertiaInput', () => {
	describe('With clearErrorsOnChange = true', () => {
		it('clears errors on an input when the value changes ', () => {
			render(
				<Form role="form" to="/" data={ { name: '' } } remember={ false }>
					<FormContextTest />
					<TestInput name="name"  />
				</Form>,
			)

			const errorButton = screen.getByRole('button', { name: 'error' })
			const input = screen.getByRole('input')

			fireEvent.click(errorButton)
			expect(screen.getByTestId('errors')).toHaveTextContent('{"name":"Error"}')

			fireEvent.change(input, { target: { value: 'something' } })
			expect(screen.getByTestId('errors')).toHaveTextContent('{}')
		})

	})

	describe('With clearErrorsOnChange = true', () => {
		it('doesn\'t clear errors on an input when the value changes', () => {
			render(
				<Form role="form" to="/" data={ { name: '' } } remember={ false }>
					<FormContextTest />
					<TestInput name="name" clearErrorsOnChange={ false } />
				</Form>,
			)

			const errorButton = screen.getByRole('button', { name: 'error' })
			const input = screen.getByRole('input')

			fireEvent.click(errorButton)
			expect(screen.getByTestId('errors')).toHaveTextContent('{"name":"Error"}')

			fireEvent.change(input, { target: { value: 'something' } })
			expect(screen.getByTestId('errors')).toHaveTextContent('{"name":"Error"}')
		})

	})
})
