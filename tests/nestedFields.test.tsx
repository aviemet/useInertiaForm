import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
	Form,
	Input,
	NestedFields,
} from '../src'
import ContextTest from './components/ContextTest'

describe('NestedFields', () => {
	it('adds values to the form data object', () => {
		render(
			<Form role="form" to="/" model="user" remember={ false }>
				<Input name="username" />

				<NestedFields model="nest">
					<Input name="nested_value" />
				</NestedFields>

				<ContextTest />
			</Form>,
		)

		expect(screen.getByTestId('data')).toHaveTextContent(
			'{"user":{"username":"","nest":{"nested_value":""}}}',
		)

	})
})
