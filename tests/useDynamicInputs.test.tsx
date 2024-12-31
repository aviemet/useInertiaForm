import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
	Form,
	useForm,
	DynamicInputs,
	useDynamicInputs,
	Input,
} from '../src'
import { multiRootData } from './components/data'
import ContextTest from './components/ContextTest'

describe('DynamicInputs', () => {
	describe('With data object passed in', () => {

		it('renders dynamic input fields', () => {
			render(
				<Form to="/form" data={ multiRootData } model="contact" remember={ false }>
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
				<Form to="/form" data={ multiRootData } model="contact" remember={ false }>
					<TestComponent />
				</Form>,
			)

			function TestComponent() {
				form = useForm<typeof multiRootData>()
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
				<Form to="/form" data={ multiRootData } model="contact" remember={ false }>
					<TestComponent />
				</Form>,
			)

			function TestComponent() {
				form = useForm<typeof multiRootData>()
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

	/**
	 * No data prop tests
	 */
	describe('With no data object passed in', () => {

		it('renders dynamic input fields', () => {
			render(
				<Form to="/form" model="contact" remember={ false }>
					<DynamicInputs model="phones" emptyData={ { title: '', number: '+1' } }>
						<Input name="title" />
						<Input name="number" />
					</DynamicInputs>

					<ContextTest />
				</Form>,
			)

			const buttons = screen.getAllByRole('button')
			const dataEl = screen.getByTestId('data')

			act(() => {
				buttons[0].click()
			})

			expect(buttons.length).toBe(1)
			expect(dataEl).toHaveTextContent('{"contact":{"phones":[{"title":"","number":"+1"}]}}')
		})

		it('adds inputs', () => {
			let form, inputs

			function TestComponent() {
				form = useForm<typeof multiRootData>()
				inputs = useDynamicInputs({
					model: 'phones',
					emptyData: { number: '' },
				})
				return null
			}

			render(
				<Form to="/form" model="contact" remember={ false }>
					<TestComponent />
				</Form>,
			)

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
			expect(phones).toContainEqual({ number: '2' })
		})

		it('removes inputs', () => {
			let form, inputs

			render(
				<Form to="/form" model="contact" remember={ false }>
					<TestComponent />
				</Form>,
			)

			function TestComponent() {
				form = useForm<typeof multiRootData>()
				inputs = useDynamicInputs({
					model: 'phones',
					emptyData: { number: '' },
				})
				return null
			}


			act(() => {
				inputs.addInput()
				inputs.addInput()
			})

			expect(form.getData('contact.phones').length).toEqual(2)

			act(() => {
				inputs.removeInput(1)
			})

			expect(form.getData('contact.phones').length).toEqual(1)

		})
	})
})
