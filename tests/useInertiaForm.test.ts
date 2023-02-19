import { act, renderHook } from '@testing-library/react-hooks'
import { useInertiaForm } from '../src'

const initialData = {
	user: {
		username: 'username',
	},
	person: {
		first_name: 'first',
		last_name: 'last',
	},
	contact: {
		phone: {
			number: '1234567890',
		},
	},
}

describe('useInertiaForm', () => {
	const { result } = renderHook(() => useInertiaForm(initialData))
	const form = result.current

	it('should return an object containing a super-set of Inertiajs form values', () => {
		expect(form.data).toStrictEqual(initialData)
	})
})


describe('setData', () => {
	const { result } = renderHook(() => useInertiaForm(initialData))
	const form = result.current

	it('should update nested state', () => {
		act(() => {
			form.setData('user.username', 'changed')
			console.log({ data: form.data })
		})
		expect(form.data.user.username).toStrictEqual('changed')
	})
})
