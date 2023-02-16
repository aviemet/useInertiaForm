import { renderHook } from '@testing-library/react-hooks'
import { useInertiaForm } from '../src'

describe('useInertiaForm', () => {
	it('should return an object containing a super-set of Inertiajs form values', () => {
		let form

		const data = {
			test: {
				v: 'v',
			},
		}

		const { rerender } = renderHook(() => {
			form = useInertiaForm(data)
		})

		rerender()
		expect(form.data).toStrictEqual(data)
	})
})
