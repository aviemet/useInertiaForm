import { setupServer } from 'msw/node'
import { http } from 'msw'
import { router } from '@inertiajs/core'
import { renderHook, act } from '@testing-library/react-hooks'
import { useInertiaForm } from '../src'

const server = setupServer(
	http.post('/form', async () => {})
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('submit', () => {
	it('should handle response details correctly', async () => {
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
			result.current.submit('post', '/form')
		})

		expect(result.current.errors).toMatchObject({
			email: ['must exist'],
		})
	})
})
