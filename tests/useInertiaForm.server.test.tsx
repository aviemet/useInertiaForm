import { router } from '@inertiajs/core'
import { renderHook, act } from '@testing-library/react-hooks'
import { server } from './server.mock'
import { useInertiaForm } from '../src'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('submit', () => {
	describe('flat data forms with errors', () => {
		it('should handle flat data with one key', async () => {
			const testData = {
				email: 'some name',
			}

			jest.spyOn(router, 'post').mockImplementation((url, data, options) => {
				options.onError({
					// @ts-ignore
					email: ['must exist'],
				})
			})

			const { result } = renderHook(() => useInertiaForm(testData))

			await act(async () => {
				result.current.submit('post', '/api/data-error')
			})

			expect(result.current.errors).toMatchObject({
				email: ['must exist'],
			})
		})

		it('should flat data with more than one key', async () => {
			const testData = {
				email: 'some email',
				user: 'some name',
			}

			jest.spyOn(router, 'post').mockImplementation((url, data, options) => {
				options.onError({
					// @ts-ignore
					email: ['must exist'],
					// @ts-ignore
					username: ['must exist'],
				})
			})

			const { result } = renderHook(() => useInertiaForm(testData))

			await act(async () => {
				result.current.submit('post', '/api/data-error')
			})

			expect(result.current.errors).toMatchObject({
				email: ['must exist'],
				username: ['must exist'],
			})
		})
	})

	describe('nested data', () => {
		it('should nest errors', async () => {
			const testData = {
				user: {
					email: 'some email',
					username: 'some name',
				},
			}

			jest.spyOn(router, 'post').mockImplementation((url, data, options) => {
				options.onError({
					// @ts-ignore
					email: ['must exist'],
					// @ts-ignore
					username: ['must exist'],
				})
			})

			const { result } = renderHook(() => useInertiaForm(testData))

			await act(async () => {
				result.current.submit('post', '/api/data-error')
			})

			expect(result.current.errors).toMatchObject({
				'user.email': ['must exist'],
				'user.username': ['must exist'],
			})
		})
	})
})
