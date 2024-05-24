import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form, useForm } from '../src/Form'
import Input from '../src/Inputs/Input'
import { DynamicInputs, useDynamicInputs } from '../src'
import { act } from '@testing-library/react-hooks'
import { multiRootData } from './components/data'

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







	describe('With no data object passed in', () => {

		it('renders dynamic input fields', () => {
			render(
				<Form to="/form" model="contact" remember={ false }>
					<DynamicInputs model="phones" emptyData={ { number: '' } }>
						<Input name="number" />
					</DynamicInputs>
				</Form>,
			)

			const buttons = screen.getAllByRole('button')

			expect(buttons.length).toBe(1)
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
})
