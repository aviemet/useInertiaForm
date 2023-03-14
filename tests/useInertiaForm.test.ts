/**
 * @jest-environment jsdom
 */

import React from 'react'
import { act, renderHook } from '@testing-library/react-hooks'
import { render, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { useInertiaForm, Form } from '../src'
import { cloneDeep } from 'lodash'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const axiosMock = new MockAdapter(axios)

const initialData = {
	user: {
		username: 'some name',
	},
	person: {
		first_name: 'first',
		last_name: 'last',
		middle_name: undefined,
	},
	contact: {
		phones: [
			{ number: '1234567890' },
			{ number: '2234567890' },
			{ number: '3234567890' },
		],
	},
}


describe('useInertiaForm', () => {
	const { result } = renderHook(() => useInertiaForm(initialData))
	const { data } = result.current

	it('data value should be equal to initialData, with undefined values converted to empty strings', () => {
		const expectedValue = cloneDeep(initialData)
		// @ts-ignore
		expectedValue.person.middle_name = ''
		expect(data).toStrictEqual(expectedValue)
	})
})

describe('setData', () => {
	it('should update nested state', () => {

		const { result } = renderHook(() => useInertiaForm(initialData))
		act(() => {
			result.current.setData('user.username', 'changed')
			result.current.setData('contact.phones[0].number', '234567')
			result.current.setData('contact.phones[3].number', 'new number')
		})

		expect(result.current.data.user.username).toStrictEqual('changed')
		expect(result.current.data.contact.phones[0].number).toStrictEqual('234567')
		expect(result.current.data.contact.phones[3].number).toStrictEqual('new number')
	})
})

describe('getData', () => {
	it('should get nested state', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		act(() => {
			expect(result.current.getData('user.username')).toStrictEqual(initialData.user.username)
			expect(result.current.getData('contact.phones[0].number')).toStrictEqual(initialData.contact.phones[0].number)
		})
	})
})

describe('unsetData', () => {
	it('should remove nested state', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		act(() => {
			result.current.unsetData('user.username')
		})

		act(() => {
			expect(result.current.data.user).toStrictEqual({})
		})
	})


	it('should reorder arrays when removing an element', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		act(() => {
			result.current.unsetData('contact.phones[1]')
		})

		act(() => {
			expect(result.current.data.contact.phones[0].number).toStrictEqual('1234567890')
			expect(result.current.data.contact.phones[1].number).toStrictEqual('3234567890')
		})
	})
})

// Test not strictly necessary since we don't override setError
describe('setError', () => {
	it('should set errors by key', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		const key = 'person.middle_name'
		const error = 'Value must not be empty'

		act(() => {
			result.current.setError(key, error)
		})

		act(() => {
			expect(result.current.errors).toStrictEqual({ [key]: error })
			expect(result.current.hasErrors).toBe(true)
		})
	})

	it('should set errors by object', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		const errors = {
			'person.middle_name': 'Value must not be empty',
			'contact.phones[1].number': 'Value is no good!',
		}

		act(() => {
			result.current.setError(errors)
		})

		act(() => {
			expect(result.current.errors).toStrictEqual(errors)
			expect(result.current.hasErrors).toBe(true)
		})
	})
})

describe('getError', () => {
	it('should return a single error by key', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		const key = 'person.middle_name'
		const error = 'Value must not be empty'

		act(() => {
			result.current.setError(key, error)
		})

		act(() => {
			expect(result.current.getError(key)).toBe(error)
		})
	})
})


// describe('form submit', () => {
// 	it('fetches', async () => {
// 		const data = {
// 			one: 'two',
// 		}

// 		const { result } = renderHook(() => useInertiaForm(initialData))

// 		act(() => {
// 			result.current.transform(data => ({ ...data, extra: 1 }))
// 		})

// 		axiosMock.onAny('/form').reply((config) => {
// 			console.log(config)
// 			return [200, data]
// 		})

// 		await act(async () => {
// 			const response = await result.current.submit('post', '/form')
// 			console.log({ response })
// 		})
// 	})
// })

// let response
// const server = setupServer(
// 	rest.post('/form', (req, res, ctx) => {
// 		console.log('intercepted')
// 		response = { req, res, ctx }
// 	}),
// )

// describe('transform', () => {
// 	it('should persist function and run before form submit', async () => {
// 		server.listen()

// 		const { result } = renderHook(() => useInertiaForm(initialData))

// 		act(() => {
// 			result.current.transform(data => ({ ...data, extra: 1 }))
// 		})

// 		await act(async () => {
// 			await result.current.submit('post', '/form')
// 			await setTimeout(() => console.log({ response }), 1000)
// 		})

// 		server.close()
// 	})
// })
