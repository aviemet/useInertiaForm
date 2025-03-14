import { isEmpty } from "lodash"

/**
 * Returns whether a value should be considered empty in the context of a form input
 */
export const isUnset = (v: any) => {
	if(v === undefined || v === null) {
		return true
	}

	if(typeof v === "string") {
		return v === ""
	}

	if(typeof v === "number") {
		return v === 0 ? false : !Boolean(v)
	}

	if(v instanceof Date) {
		return isNaN(v.valueOf())
	}

	if(typeof v === "boolean") {
		return false
	}

	return isEmpty(v)
}
