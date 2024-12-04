import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { router } from '@inertiajs/core'
import { renderHook, act } from '@testing-library/react-hooks';
import { useInertiaForm } from '../src';

const server = setupServer(
	http.post('/form', async ({ request }) => {
		const body = await request.formData();

		return HttpResponse.json(
			{
				message: 'Success',
				submittedData: body,
			},
			{ status: 302 }
		);
	})
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('submit', () => {
	it('should handle response details correctly', async () => {
		const testData = {
			user: {
				username: 'some name',
			},
		};

		jest.spyOn(router, 'post').mockImplementation((url, data, options) => {
			options.onError?.({
				errors: {
					email: ['must exist'],
				},
			})
			// return HttpResponse.json(
			// 	{
			// 		errors: {
			// 			email: ['must exist'],
			// 		},
			// 	},
			// 	{ status: 302 }
			// );
		});

		const { result } = renderHook(() => useInertiaForm(testData));

		await act(async () => {
			// Call submit and simulate server error
			result.current.submit('post', '/form');
		});

		console.log({ result: result.current })
		// Assert that response contains the transformed data and a success message
		expect(result.current.errors).toMatchObject({
			data: {
				message: 'Success',
				submittedData: {
					user: { username: 'some name' },
				},
			},
		});
	});
});



















// const initialData = {
// 	user: {
// 		email: '',
// 		password: '',
// 	},
// }

describe("FUCK", () => {
	it("fucks off", () => {
		expect(1).toBe(1)
	})
})

// describe("useForm - server validation errors", () => {
// 	beforeEach(() => {
// 		// Mock the server's validation error response
// 		server.use(
// 			http.post("/submit", () => {
// 				return HttpResponse.json(
// 					{
// 						errors: {
// 							email: ["This field is required."],
// 						},
// 					},
// 					{ status: 302 }
// 				);
// 			})
// 		);
// 	});

// 	it("updates the error object when server returns validation errors", async () => {
// 		const { result } = renderHook(() =>
// 			useInertiaForm(initialData)
// 		);

// 		// Act: Trigger the POST request
// 		await act(async () => {
// 			await result.current.post("/submit");
// 			// console.log({ result: result.current })
// 		});

// 		// Assert: Check if errors object has the expected structure and values
// 		expect(result.current.errors).toEqual({
// 			email: ["This field is required."],
// 		});
// 	});
// });


// type UserFormData = {
// 	user: {
// 		email: string
// 		password: string
// 	}
// }

// const initialData = {
// 	user: {
// 		email: '',
// 		password: '',
// 	},
// }

// export function TestForm() {
// 	const { data, setData, post } = useInertiaForm<UserFormData>(initialData);

// 	const handleSubmit = () => {
// 		post("/submit");
// 	};

// 	return (
// 		<Form to="/submit" data={ initialData }>
// 			<Input name="email" />
// 			<Submit />
// 		</Form>
// 	);
// }










// const Home = ({ pageNumber, lastLoaded }) => {
// 	return (
// 		<div>
// 			<div>This is page { pageNumber }</div>
// 			<div>
// 				Last loaded at <span id="last-loaded">{ lastLoaded }</span>
// 			</div>
// 		</div>
// 	)
// }

// Home.layout = (page) => <div children={ page } />

// const pageComponent = (overrides: Partial<Page> = {}): Page => ({
// 	component: 'Home',
// 	props: {
// 		errors: {},
// 	},
// 	url: '/',
// 	version: '1',
// 	scrollRegions: [],
// 	rememberedState: {},
// 	...overrides,
// })

// export const homePage = pageComponent()

// router.init({
// 	initialPage: homePage,
// 	resolveComponent: () => {},
// 	swapComponent: () => {
// 		return Promise.resolve({
// 			component: 'home',
// 			props: {
// 				errors: {},
// 			},
// 			url: '/',
// 			version: '1',
// 			scrollRegions: [],
// 			rememberedState: {},
// 		})
// 	},
// })


// describe('onError', () => {
// 	describe('with nested data', () => {
// 		it('should set errors from server response', async () => {
// 			const testData = {
// 				user: {
// 					username: '',
// 				},
// 			}

// 			const serverErrors = {
// 				username: ['must exist'],
// 			};

// 			// Mock Inertia's initial state
// 			jest.mock('@inertiajs/inertia', () => ({
// 				Inertia: {
// 					page: {
// 						props: {
// 							errors: {}, // Start with no errors
// 						},
// 					},
// 				},
// 			}));

// 			Inertia.page.props.errors = serverErrors;

// 			await act(async () => {
// 				await result.current.submit('post', '/form')
// 				console.log({ mockRequest })
// 			})

// 			act(() => {
// 				console.log({ result: result.current })
// 				expect(result.current.errors).toEqual({
// 					username: ["must exist"],
// 				});
// 				expect(mockRequest).toHaveBeenCalledWith('/form', expect.objectContaining({ data: testData }));

// 				// expect(mockRequest).toHaveBeenCalled()
// 			})
// 		})
// 	})
// })
