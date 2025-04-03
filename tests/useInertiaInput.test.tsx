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

	describe("Text input value changes", () => {
		it("maintains empty value when all characters are deleted", () => {
			render(
				<Form role="form" to="/" model="values" data={ { values: { name: "initial" } } } remember={ false }>
					<Input role="input" name="name" />
				</Form>,
			)

			const input = screen.getByRole("input")

			// Initial state
			expect(input).toHaveValue("initial")

			// Delete some characters (backspace)
			fireEvent.input(input, { target: { value: "init" } })
			expect(input).toHaveValue("init")

			// Delete all characters (backspace)
			fireEvent.input(input, { target: { value: "" } })
			expect(input).toHaveValue("")

			// Delete all characters (select all + delete)
			fireEvent.input(input, { target: { value: "" } })
			expect(input).toHaveValue("")

			// Try setting to undefined
			fireEvent.input(input, { target: { value: undefined } })
			expect(input).toHaveValue("")

			// Verify value stays empty
			expect(input).toHaveValue("")
		})
	})
})
