import { act, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import {
	Form,
	Input,
	Submit,
} from "../src"
import { router } from "@inertiajs/react"
import { Page, type PendingVisit } from "@inertiajs/core"
import { get } from "lodash"
import ContextTest from "./components/ContextTest"
import { multiRootData, singleRootData } from "./components/data"
import axios from "axios"

describe("Form Component", () => {
	describe("When not passed a data object", () => {
		it("builds the data object from inputs", () => {
			render(
				<Form role="form" to="/" remember={ false }>
					<Input name="user.username" />
					<Input name="user.firstName" />
					<Input name="user.lastName" />

					<ContextTest />
				</Form>,
			)

			expect(screen.getByTestId("data")).toHaveTextContent(
				"{\"user\":{\"username\":\"\",\"firstName\":\"\",\"lastName\":\"\"}}",
			)
		})
	})

	describe("When passed a data object", () => {
		it("it uses the data values ignoring defaultValue", () => {
			render(
				<Form role="form" to="/" remember={ false } data={ {
					user: {
						username: "username",
						firstName: "Firsty",
						lastName: "Lasty",
					},
				} }>
					<Input name="user.username" defaultValue="default1" />
					<Input name="user.firstName" defaultValue="default2" />
					<Input name="user.lastName" defaultValue="default3" />

					<ContextTest />
				</Form>,
			)

			expect(screen.getByTestId("data")).toHaveTextContent(
				"{\"user\":{\"username\":\"username\",\"firstName\":\"Firsty\",\"lastName\":\"Lasty\"}}",
			)
		})

		it("adds missing keys to the data object from inputs", () => {
			render(
				<Form role="form" to="/" remember={ false } data={ {
					user: {
						username: "username",
						firstName: "Firsty",
					},
				} }>
					<Input name="user.username" />
					<Input name="user.firstName" />
					<Input name="user.lastName" defaultValue="Lasty" />

					<ContextTest />
				</Form>,
			)

			expect(screen.getByTestId("data")).toHaveTextContent(
				"{\"user\":{\"username\":\"username\",\"firstName\":\"Firsty\",\"lastName\":\"Lasty\"}}",
			)
		})
	})

	/**
	 * Rails Attributes `false` tests
	 */
	describe("With railsAttributes false", () => {
		it("renders a form with values in inputs", () => {
			render(
				<Form role="form" to="/form" data={ { ...multiRootData } } remember={ false }>
					<Input name="user.username" />
				</Form>,
			)

			const input = screen.getByRole("textbox")

			expect(input).toHaveValue(multiRootData.user.username)
		})

		it("updates form data with user input", () => {
			render(
				<Form role="form" to="/form" data={ { ...singleRootData } } model="person" remember={ false }>
					<Input name="nested.key" />
				</Form>,
			)

			const input = screen.getByRole("textbox")

			fireEvent.change(input, { target: { value: "modified form data" } })
			expect(input).toHaveValue("modified form data")
		})

		describe("when async is false", () => {
			it("sends the correct data to the server upon form submit", async() => {
				let capturedData: any

				const mockRequest = jest.spyOn(router, "visit").mockImplementation((route, request) => {
					capturedData = request?.data

					return Promise.resolve({ data: request?.data })
				})

				render(
					<Form model="person" to="/form" data={ { ...singleRootData } } remember={ false }>
						<Input name="first_name" />
						<Input name="nested.key" />
						<Submit>Submit</Submit>
					</Form>,
				)

				const button = screen.getByRole("button")
				await fireEvent.click(button)

				expect(mockRequest).toHaveBeenCalled()

				expect(get(capturedData, "person.nested.key")).toBe("value")
			})
		})

		describe("when async is true", () => {
			it("sends the correct data to the server upon form submit", async() => {
				let capturedData: any
				const mockRequest = jest.spyOn(axios, "post").mockImplementation((url, data, config) => {
					capturedData = data
					return Promise.resolve({ data })
				})

				render(
					<Form async model="person" to="/form" data={ { ...singleRootData } } remember={ false }>
						<Input name="first_name" />
						<Input name="nested.key" />
						<Submit>Submit</Submit>
					</Form>,
				)

				await act(async() => {
					const button = screen.getByRole("button")
					await fireEvent.click(button)
				})

				expect(mockRequest).toHaveBeenCalled()

				expect(get(capturedData, "person.nested.key")).toBe("value")
			})
		})
	})

	/**
	 * Rails Attributes `true` tests
	 */
	describe("With railsAttributes true", () => {
		it("renders a form with values in inputs", () => {
			render(
				<Form
					role="form"
					to="/form"
					data={ { ...multiRootData } }
					railsAttributes={ true }
					remember={ false }
				>
					<Input name="user.username" />
				</Form>,
			)

			const input = screen.getByRole("textbox")
			expect(input).toHaveValue(multiRootData.user.username)
		})

		it("updates values as normal", () => {
			render(
				<Form
					to="/form"
					data={ singleRootData }
					model="person"
					railsAttributes={ true }
					remember={ false }
				>
					<Input name="nested.key" />
				</Form>,
			)

			const input = screen.getByRole("textbox")

			fireEvent.change(input, { target: { value: "rails attributes" } })
			expect(input).toHaveValue("rails attributes")
		})

		describe("with async false", () => {
			it("sends the correct data to the server upon form submit", () => {
				let capturedData: any

				const mockRequest = jest.spyOn(router, "visit").mockImplementation((route, request) => {
					capturedData = request?.data

					return Promise.resolve({ data: request?.data })
				})

				const handleSubmit = (form) => {
					form.transform(data => ({ ...data, extra: { value: "exists" } }))
				}

				render(
					<Form
						model="person"
						to="/form"
						data={ multiRootData }
						railsAttributes
						remember={ false }
						onSubmit={ handleSubmit }
					>
						<Input name="first_name" />
						<Input name="nested.key" />
						<Submit>Submit</Submit>
					</Form>,
				)

				const button = screen.getByRole("button")
				fireEvent.click(button)

				expect(mockRequest).toHaveBeenCalled()

				expect(get(capturedData, "user.username")).toBe(multiRootData.user.username)
				expect(get(capturedData, "person.nested_attributes.key")).toBe(multiRootData.person.nested.key)
				expect(get(capturedData, "extra.value")).toBe("exists")
			})
		})

		describe("with async true", () => {
			it("sends the correct data to the server upon form submit", async() => {
				let capturedData: any

				const mockRequest = jest.spyOn(axios, "post").mockImplementation((url, data, config) => {
					capturedData = data

					return Promise.resolve({ data })
				})

				const handleSubmit = (form) => {
					form.transform(data => ({ ...data, extra: { value: "exists" } }))
				}

				render(
					<Form
						async
						model="person"
						to="/form"
						data={ singleRootData }
						railsAttributes
						remember={ false }
						onSubmit={ handleSubmit }
					>
						<Input name="first_name" />
						<Input name="nested.key" />
						<Submit>Submit</Submit>
					</Form>,
				)

				await act(async() => {
					const button = screen.getByRole("button")
					await fireEvent.click(button)
				})

				expect(mockRequest).toHaveBeenCalled()

				expect(get(capturedData, "person.first_name")).toEqual(singleRootData.person.first_name)
				expect(get(capturedData, "person.nested_attributes.key")).toEqual(singleRootData.person.nested.key)
				expect(get(capturedData, "extra.value")).toEqual("exists")
			})
		})
	})

	describe("Filter", () => {
		it("unsets data at the given paths", () => {
			const handleChange = (form) => {
				expect(form.data.person.last_name).toBeUndefined()
				expect(form.data.user.username).toBeUndefined()
				expect(form.data.person.first_name).toBeDefined()
				expect(form.data.contact.phones[0].number).toBeDefined()
				expect(form.data.contact.phones[0].type).toBeUndefined()
			}

			() => render(
				<Form
					model="person"
					to="/form"
					data={ multiRootData }
					filter={ ["person.last_name", "user.username", "contact.phones[].type"] }
					onChange={ handleChange }
				>
					<Input name="first_name" />
					<Submit>Submit</Submit>
				</Form>,
			)
		})
	})

	describe("when async is false", () => {
		it("should trigger all callbacks in correct order with progress", async() => {
			const callOrder: string[] = []
			const callbacks = {
				onBefore: jest.fn(() => {
					callOrder.push("onBefore")
				}),
				onStart: jest.fn(() => {
					callOrder.push("onStart")
				}),
				onProgress: jest.fn(() => {
					callOrder.push("onProgress")
				}),
				onSuccess: jest.fn(() => {
					callOrder.push("onSuccess")
				}),
				onError: jest.fn(),
				onFinish: jest.fn(() => {
					callOrder.push("onFinish")
				}),
			}

			const mockRequest = jest.spyOn(router, "visit").mockImplementation((route, request) => {
				const pendingVisit: PendingVisit = Object.assign({
					url: new URL(`http://www.example.com${route}`),
					method: "post",
					data: {},
					replace: false,
					preserveScroll: false,
					preserveState: false,
					only: [],
					except: [],
					headers: {},
					errorBag: null,
					forceFormData: false,
					queryStringArrayFormat: "indices",
					async: false,
					showProgress: false,
					prefetch: false,
					fresh: false,
					reset: [],
					preserveUrl: false,
					completed: false,
					cancelled: false,
					interrupted: false,
				}, request)

				request.onBefore(pendingVisit)
				request.onStart(pendingVisit)
				request.onSuccess({
					component: "Page",
					props: {},
					url: `http://www.example.com${route}`,
					version: "",
					clearHistory: true,
					encryptHistory: true,
				} as Page<{}>)
				request.onFinish(pendingVisit as any)

				return Promise.resolve(request)
			})

			render(
				<Form
					model="person"
					to="/form"
					data={ singleRootData }
					onBefore={ callbacks.onBefore }
					onStart={ callbacks.onStart }
					onProgress={ callbacks.onProgress }
					onSuccess={ callbacks.onSuccess }
					onFinish={ callbacks.onFinish }
				>
					<Input name="first_name" />
					<Submit>Submit</Submit>
				</Form>
			)

			const button = screen.getByRole("button")
			await act(async() => {
				await fireEvent.click(button)
			})

			expect(mockRequest).toHaveBeenCalled()

			expect(callbacks.onBefore).toHaveBeenCalled()
			expect(callbacks.onStart).toHaveBeenCalled()
			expect(callbacks.onSuccess).toHaveBeenCalled()
			expect(callbacks.onFinish).toHaveBeenCalled()

		})
	})
})
