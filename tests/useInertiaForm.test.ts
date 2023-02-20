import { act, renderHook } from '@testing-library/react-hooks'
import { useInertiaForm } from '../src'
import { cloneDeep } from 'lodash'

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
