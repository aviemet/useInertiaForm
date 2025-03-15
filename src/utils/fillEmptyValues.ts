import { isPlainObject } from "es-toolkit"

/**
 * Replaces undefined or null values with empty values,
 *   either empty strings, empty arrays, or empty objects
 * Allows using values from the server which may contain
 *   undefined or null values in a React controlled input
 */
export const fillEmptyValues = <TForm>(data: TForm) => {
	const clone = structuredClone(data ?? {} as TForm)

	for(const key in clone) {
		if(isPlainObject(clone[key])) {
			// @ts-ignore
			clone[key] = fillEmptyValues(clone[key])
		} else if(Array.isArray(clone[key])) {
			// @ts-ignore
			clone[key] = clone[key].map(el => fillEmptyValues(el))
		} else if(clone[key] === undefined || clone[key] === null) {
			// @ts-ignore
			clone[key] = ""
		}
	}

	return clone
}
