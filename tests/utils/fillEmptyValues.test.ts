import { fillEmptyValues } from "../../src/utils"

describe("fillEmptyValues", () => {
	it("should replace undefined or null values with empty strings", () => {
		const sanitized = fillEmptyValues({
			one: "one",
			two: undefined,
			three: null,
			nested: {
				four: undefined,
				five: null,
			},
		})

		expect(sanitized).toMatchObject({
			one: "one",
			two: "",
			three: "",
			nested: {
				four: "",
				five: "",
			},
		})
	})
})
