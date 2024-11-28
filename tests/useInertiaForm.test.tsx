import React from 'react'
import { act, renderHook } from '@testing-library/react-hooks'
import { router, type Page } from '@inertiajs/core'
import { useInertiaForm } from '../src'
import { get } from 'lodash'

const Home = ({ pageNumber, lastLoaded }) => {
	return (
		<div>
			<div>This is page { pageNumber }</div>
			<div>
				Last loaded at <span id="last-loaded">{ lastLoaded }</span>
			</div>
		</div>
	)
}

Home.layout = (page) => <div children={ page } />

const pageComponent = (overrides: Partial<Page> = {}): Page => ({
	component: 'Home',
	props: {
		errors: {},
	},
	url: '/',
	version: '1',
	scrollRegions: [],
	rememberedState: {},
	...overrides,
})

export const homePage = pageComponent()

router.init({
	initialPage: homePage,
	resolveComponent: () => {},
	swapComponent: () => {
		return Promise.resolve({
			component: 'home',
			props: {
				errors: {},
			},
			url: '/',
			version: '1',
			scrollRegions: [],
			rememberedState: {},
		})
	},
})

type InitialData = {
	user: {
		username?: string
	}
	person: {
		first_name?: string
		last_name?: string
		middle_name?: string | undefined
	}
	contact: {
		phones: { number?: string }[]
	}
}

const initialData: InitialData = {
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

const flatData: Record<string, string | undefined> = {
	first_name: 'first',
	middle_name: undefined,
	last_name: 'last',
}

const singleValue: Record<string, string | undefined> = {
	first_name: undefined,
}

describe('useInertiaForm', () => {
	describe('with nested data', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		it('data value should be equal to initialData, with undefined values converted to empty strings', () => {
			const expectedValue = structuredClone(initialData)
			expectedValue.person.middle_name = ''
			expect(result.current.data).toStrictEqual(expectedValue)
		})
	})

	describe('with flat data', () => {
		const { result } = renderHook(() => useInertiaForm(flatData))

		it('data value should be equal to flatData, with undefined values converted to empty strings', () => {
			const expectedValue = structuredClone(flatData)
			expectedValue.middle_name = ''
			expect(result.current.data).toStrictEqual(expectedValue)
		})
	})

	describe('with only one key', () => {
		const { result } = renderHook(() => useInertiaForm(singleValue))

		it('data value should be equal to singleValue, with undefined values converted to empty strings', () => {
			const expectedValue = structuredClone(singleValue)
			expectedValue.first_name = ''
			expect(result.current.data).toStrictEqual(expectedValue)
		})
	})
})

describe('setData', () => {
	describe('with nested data', () => {
		it('should update nested state', () => {

			const { result } = renderHook(() => useInertiaForm(initialData))
			act(() => {
				result.current.setData('user.username', 'changed')
			})

			expect(result.current.data?.user.username).toStrictEqual('changed')
		})

		it('should update nested array values', () => {

			const { result } = renderHook(() => useInertiaForm(initialData))
			act(() => {
				result.current.setData('contact.phones[0].number', '234567')
				result.current.setData('contact.phones[3].number', 'new number')
			})

			expect(result.current.data?.contact.phones[0].number).toStrictEqual('234567')
			expect(result.current.data?.contact.phones[3].number).toStrictEqual('new number')
		})
	})

	describe('with flat data', () => {
		it('should update state', () => {

			const { result } = renderHook(() => useInertiaForm(flatData))
			act(() => {
				result.current.setData('first_name', 'changed')
			})

			expect(result.current.data?.first_name).toStrictEqual('changed')
		})
	})

	describe('with only one key', () => {
		it('should update state', () => {

			const { result } = renderHook(() => useInertiaForm(singleValue))
			act(() => {
				result.current.setData('first_name', 'changed')
			})

			expect(result.current.data?.first_name).toStrictEqual('changed')
		})
	})
})

describe('getData', () => {
	describe('with nested data', () => {
		it('should get initial nested state', () => {
			const { result } = renderHook(() => useInertiaForm(initialData))

			act(() => {
				expect(result.current.getData('user.username')).toStrictEqual(initialData.user.username)
				expect(result.current.getData('contact.phones[0].number')).toStrictEqual(initialData.contact.phones[0].number)
			})
		})

		it('should get updated nested state', () => {
			const { result } = renderHook(() => useInertiaForm(initialData))

			act(() => {
				result.current.setData('user.username', 'something')
				result.current.setData('contact.phones[0].number', '123-456-7890')
			})

			act(() => {
				expect(result.current.getData('user.username')).toStrictEqual('something')
				expect(result.current.getData('contact.phones[0].number')).toStrictEqual('123-456-7890')
			})
		})
	})

	describe('with flat data', () => {
		it('should get initial state', () => {
			const { result } = renderHook(() => useInertiaForm(flatData))

			act(() => {
				expect(result.current.getData('first_name')).toStrictEqual(flatData.first_name)
				expect(result.current.getData('middle_name')).toStrictEqual('')
			})
		})

		it('should get updated state', () => {
			const { result } = renderHook(() => useInertiaForm(flatData))

			act(() => result.current.setData('middle_name', 'something'))

			act(() => {
				expect(result.current.getData('middle_name')).toStrictEqual('something')
			})
		})
	})

	describe('with only one key', () => {
		it('should get nested state', () => {
			const { result } = renderHook(() => useInertiaForm(singleValue))

			act(() => {
				expect(result.current.getData('first_name')).toStrictEqual('')
			})
		})
	})

	describe('with only one key', () => {
		it('should get updated state', () => {
			const { result } = renderHook(() => useInertiaForm(singleValue))

			act(() => result.current.setData('first_name', 'something'))

			act(() => {
				expect(result.current.getData('first_name')).toStrictEqual('something')
			})
		})
	})
})

describe('unsetData', () => {
	describe('with nested data', () => {
		it('should remove nested state', () => {
			const { result } = renderHook(() => useInertiaForm(initialData))

			act(() => result.current.unsetData('user.username'))

			act(() => expect(result.current.data?.user).toMatchObject({}))
		})


		it('should reorder arrays when removing an element', () => {
			const { result } = renderHook(() => useInertiaForm(initialData))

			act(() => result.current.unsetData('contact.phones[1]'))

			act(() => {
				expect(result.current.data?.contact.phones[0].number).toStrictEqual('1234567890')
				expect(result.current.data?.contact.phones[1].number).toStrictEqual('3234567890')
			})
		})
	})

	describe('with flat data', () => {
		it('should remove a value', () => {
			const { result } = renderHook(() => useInertiaForm(flatData))

			act(() => result.current.unsetData('first_name'))

			act(() => {
				expect(result.current.data).not.toHaveProperty('first_name')
				// Others are untouched
				expect(result.current.data?.last_name).toStrictEqual(flatData.last_name)
			})
		})
	})

	describe('with only one key', () => {
		it('should remove a value', () => {
			const { result } = renderHook(() => useInertiaForm(singleValue))

			act(() => result.current.unsetData('first_name'))

			act(() => {
				expect(result.current.data).not.toHaveProperty('first_name')
				expect(result.current.data).toEqual({})
			})
		})
	})
})

// Tests not strictly necessary since we don't override setError
describe('setError', () => {
	describe('with nested data', () => {
		it('should set errors by key', () => {
			const { result } = renderHook(() => useInertiaForm(initialData))

			const key = 'person.middle_name'
			const error = 'Value must not be empty'

			act(() => result.current.setError(key, error))

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

			act(() => result.current.setError(errors))

			act(() => {
				expect(result.current.errors).toStrictEqual(errors)
				expect(result.current.hasErrors).toBe(true)
			})
		})
	})

	describe('with flat data', () => {
		it('should set errors by key', () => {
			const { result } = renderHook(() => useInertiaForm(flatData))

			const key = 'middle_name'
			const error = 'Value must not be empty'

			act(() => result.current.setError(key, error))

			act(() => {
				expect(result.current.errors).toStrictEqual({ [key]: error })
				expect(result.current.hasErrors).toBe(true)
			})
		})

		it('should set errors by object', () => {
			const { result } = renderHook(() => useInertiaForm(flatData))

			const errors = {
				'first_name': 'Value must not be empty',
				'middle_name': 'Value is no good!',
			}

			act(() => result.current.setError(errors))

			act(() => {
				expect(result.current.errors).toStrictEqual(errors)
				expect(result.current.hasErrors).toBe(true)
			})
		})
	})

	describe('with only one key', () => {
		it('should set errors by key', () => {
			const { result } = renderHook(() => useInertiaForm(singleValue))

			const key = 'first_name'
			const error = 'Value must not be empty'

			act(() => result.current.setError(key, error))

			act(() => {
				expect(result.current.errors).toStrictEqual({ [key]: error })
				expect(result.current.hasErrors).toBe(true)
			})
		})

		it('should set errors by object', () => {
			const { result } = renderHook(() => useInertiaForm(singleValue))

			const errors = {
				'first_name': 'Value must not be empty',
			}

			act(() => result.current.setError(errors))

			act(() => {
				expect(result.current.errors).toStrictEqual(errors)
				expect(result.current.hasErrors).toBe(true)
			})
		})
	})
})

describe('getError', () => {
	describe('with nested data', () => {
		it('should return a single error by key', () => {
			const { result } = renderHook(() => useInertiaForm(initialData))

			const key = 'person.middle_name'
			const error = 'Value must not be empty'

			act(() => result.current.setError(key, error))

			act(() => expect(result.current.getError(key)).toBe(error))
		})
	})

	describe('with flat data', () => {
		it('should return a single error by key', () => {
			const { result } = renderHook(() => useInertiaForm(flatData))

			const key = 'middle_name'
			const error = 'Value must not be empty'

			act(() => result.current.setError(key, error))

			act(() => expect(result.current.getError(key)).toBe(error))
		})
	})

	describe('with single value', () => {
		it('should return a single error by key', () => {
			const { result } = renderHook(() => useInertiaForm(singleValue))

			const key = 'first_name'
			const error = 'Value must not be empty'

			act(() => result.current.setError(key, error))

			act(() => expect(result.current.getError(key)).toBe(error))
		})
	})
})

describe('clearErrors', () => {
	it('should remove one error when supplied a string', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		const key = 'person.middle_name'

		act(() => result.current.setError(key, 'Value must not be empty'))
		act(() => result.current.clearErrors(key))

		act(() => expect(result.current.errors).toEqual({}))
	})

	it('should remove several errors when supplied an array of strings', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		const keys = ['user.username', 'person.middle_name', 'person.last_name']
		const error = 'There is an error'
		act(() => {
			keys.forEach(key => {
				result.current.setError(key, error)
			})
		})

		act(() => result.current.clearErrors(keys.slice(0, -1)))

		act(() => expect(result.current.errors).toEqual({ [keys[2]]: error }))
	})

	it('should remove all errors when called with no arguments', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		const keys = ['user.username', 'person.middle_name', 'person.last_name']
		const error = 'There is an error'

		act(() => {
			keys.forEach(key => {
				result.current.setError(key, error)
			})
		})

		act(() => result.current.clearErrors())

		act(() => expect(result.current.errors).toEqual({}))
	})
})

describe('setDefaults and reset', () => {
	const newData = structuredClone(initialData)
	newData.user.username = 'changed'
	newData.person.middle_name = 'Another'
	newData.contact.phones = []

	it('should set defaults to the current values of form data when given no arguments', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		act(() => result.current.setData(newData))
		act(() => result.current.setDefaults())
		act(() => result.current.reset())

		act(() => expect(result.current.data).toEqual(newData))
	})

	it('should set the defaults to the values of a supplied object', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		act(() => result.current.setDefaults(newData))
		act(() => result.current.reset())

		act(() => expect(result.current.data).toEqual(newData))
	})

	it('should change one default value when passed a key value pair', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		const key = 'user.username'
		const newValue = 'different'

		act(() => result.current.setDefaults(key, newValue))
		act(() => result.current.reset())

		act(() => expect(result.current.getData(key)).not.toEqual(get(initialData, key)))
		act(() => expect(result.current.getData('person.first_name')).toEqual(initialData.person.first_name))
		act(() => expect(result.current.getData(key)).toEqual(newValue))
	})

	it('should only reset a single value when reset is called with a string', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		const key = 'user.username'

		act(() => result.current.setData('user.username', 'changed'))
		act(() => result.current.reset('user.username'))

		act(() => expect(result.current.getData(key)).toEqual(initialData.user.username))
	})

	it('should reset several, but not all values, when called with an array of string', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		const keys = ['user.username', 'person.middle_name']

		act(() => result.current.setData(newData))
		act(() => result.current.reset(keys))

		act(() => expect(result.current.getData(keys[0])).toEqual(initialData.user.username))
		act(() => expect(result.current.getData(keys[1])).toEqual(''))
		act(() => expect(result.current.getData('contact.phones')).toEqual([]))
	})
})

describe('onChange', () => {
	it('should be called whenever data is changed', () => {
		const { result } = renderHook(() => useInertiaForm(initialData))

		const changeKey = 'user.username'
		const changeValue1 = 'something'

		act(() => {
			result.current.onChange((key, value, prev) => {
				expect(key).toEqual(changeKey)
				expect(value).toEqual(changeValue1)
				expect(prev).toEqual(get(initialData, changeKey))
			})
		})

		act(() => result.current.setData(changeKey, changeValue1))
	})
})

describe('submit', () => {
	it('should submit transformed data to the server', () => {
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
			expect(mockRequest).toHaveBeenCalled()
		})
	})

	describe('onError', () => {
		describe('with nested data', () => {
			it('should set errors from server response', async () => {
				const testData = {
					user: {
						username: '',
					},
				}

				const serverErrors = {
					username: ['must exist'],
				};

				// Mock Inertia's initial state
				jest.mock('@inertiajs/inertia', () => ({
					Inertia: {
						page: {
							props: {
								errors: {}, // Start with no errors
							},
						},
					},
				}));

				Inertia.page.props.errors = serverErrors;

				await act(async () => {
					await result.current.submit('post', '/form')
					console.log({ mockRequest })
				})

				act(() => {
					console.log({ result: result.current })
					expect(result.current.errors).toEqual({
						username: ["must exist"],
					});
					expect(mockRequest).toHaveBeenCalledWith('/form', expect.objectContaining({ data: testData }));

					// expect(mockRequest).toHaveBeenCalled()
				})
			})
		})
	})
})
