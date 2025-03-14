import { fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { Form, Input } from "../src"
import ContextTest from "./components/ContextTest"

describe ("useInertiaInput", () => {
	describe("With defaultValue", () => {
		it("builds the data object with default values from inputs", () => {
			render(
				<Form role="form" to="/" model="values" remember={ false }>
					<Input role="input" name="name" defaultValue="me" />

					<ContextTest />
				</Form>,
			)

			const input = screen.getByRole("input")

			expect(screen.getByTestId("data")).toHaveTextContent("{\"values\":{\"name\":\"me\"}}")

			fireEvent.change(input, { target: { value: "value" } })
			expect(screen.getByTestId("data")).toHaveTextContent("{\"values\":{\"name\":\"value\"}}")
		})
	})

	describe("With clearErrorsOnChange = true", () => {
		it("clears errors on an input when the value changes ", () => {
			render(
				<Form role="form" to="/" data={ { errors: { name: "" } } } model="errors" remember={ false }>
					<Input role="input" name="name" />

					<ContextTest cb={ form => {
						form.setError("errors.name", "Error")
					} } />
				</Form>,
			)

			const input = screen.getByRole("input")

			expect(screen.getByTestId("errors")).toHaveTextContent("{\"errors.name\":\"Error\"}")

			fireEvent.change(input, { target: { value: "something" } })
			expect(screen.getByTestId("errors")).toHaveTextContent("{}")
		})

	})

	describe("With clearErrorsOnChange = false", () => {
		it("doesn't clear errors on an input when the value changes", () => {
			render(
				<Form role="form" to="/" data={ { errors: { name: "" } } } model="errors" remember={ false }>
					<Input role="input" name="name" clearErrorsOnChange={ false } />

					<ContextTest cb={ form => {
						form.setError("errors.name", "Error")
					} } />
				</Form>,
			)

			const input = screen.getByRole("input")

			expect(screen.getByTestId("errors")).toHaveTextContent("{\"errors.name\":\"Error\"}")

			fireEvent.change(input, { target: { value: "something" } })
			expect(screen.getByTestId("errors")).toHaveTextContent("{\"errors.name\":\"Error\"}")
		})

	})
})
