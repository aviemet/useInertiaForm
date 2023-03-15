import { act, renderHook } from '@testing-library/react-hooks'
import { router } from '@inertiajs/core'
import { useInertiaForm } from '../src'

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
		const expectedValue = structuredClone(initialData)
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
			expect(result.current.data.user).toMatchObject({})
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

test('my form submits the correct data', async () => {
	const testData = {
		user: {
			username: 'some name',
		},
	}

	const mockRequest = jest.spyOn(router, 'visit').mockImplementation((route, request) => {
		expect(request?.data).toMatchObject({ ...testData, transformed: 'value' })
		return Promise.resolve({ data: request?.data })
	})

	const { result } = renderHook(() => useInertiaForm(testData))

	act(() => {
		result.current.transform(data => ({ ...data, transformed: 'value' }))
		result.current.submit('post', '/form')
		expect(mockRequest).toBeCalled()
	})
})
