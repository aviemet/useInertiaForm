import { isUnset } from "../../src/utils"

describe("isUnset", () => {
	describe("numbers", () => {
		it("should be false for any number", () => {
			expect(isUnset(0)).toBe(false)
			expect(isUnset(-0)).toBe(false)
			expect(isUnset(1)).toBe(false)
			expect(isUnset(67959516)).toBe(false)
			expect(isUnset(-66)).toBe(false)
			expect(isUnset(-985619874)).toBe(false)
		})

		it("should be true for NaN", () => {
			expect(isUnset(NaN)).toBe(true)
		})
	})

	describe("strings", () => {
		it("should be false for any non-empty string", () => {
			expect(isUnset("string")).toBe(false)
			expect(isUnset(" ")).toBe(false)
			expect(isUnset(`string literal ${1 + 1}`)).toBe(false)
		})

		it("should be true for empty strings", () => {
			expect(isUnset("")).toBe(true)
		})
	})

	describe("dates", () => {
		it("should be false for any valid date object", () => {
			expect(isUnset(new Date())).toBe(false)
		})

		it("should be true for any invalid date object", () => {
			expect(isUnset(new Date("not a date"))).toBe(true)
		})
	})

	describe("booleans", () => {
		it("should be false for true and false", () => {
			expect(isUnset(true)).toBe(false)
			expect(isUnset(false)).toBe(false)
		})

		it("should be true if variable is uninitialized", () => {
			let b: boolean
			expect(isUnset(b)).toBe(true)
		})
	})

	it("should be true for any \"empty\" primitive or empty object", () => {
		expect(isUnset(undefined)).toBe(true)
		expect(isUnset(null)).toBe(true)
		expect(isUnset([])).toBe(true)
		expect(isUnset({})).toBe(true)
	})

	it("should be false for any non-empty value", () => {
		expect(isUnset({ key: "value" })).toBe(false)
		expect(isUnset(["one"])).toBe(false)
		expect(isUnset([1])).toBe(false)
		expect(isUnset([1, "two", { three: "four" }])).toBe(false)
	})
})
