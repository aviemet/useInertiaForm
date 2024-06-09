import { unset, get  } from 'lodash'
import { type NestedObject } from '../useInertiaForm'

/**
 * Extends _.unset splice out array elements rather than leaving empty values in arrays
 *   e.g. unset(data, 'path[0]')
 * Allows special syntax of '[]' to refer to every element of an array
 *   e.g. unset(data, 'path[].key'), will recursively unset 'key' in every array element
 */
type TArrType = string|number|NestedObject
export const unsetCompact = (data: NestedObject, path: string) => {
	// Ignore tailing [] since it causes unnecessary recursion
	const sanitizedPath = path.replace(/\[\]$/, '')

	// Handle special empty array syntax
	if(sanitizedPath.includes('[]')) {
		const emptyArrayPosition = sanitizedPath.indexOf('[]')
		const startPath = sanitizedPath.slice(0, emptyArrayPosition)
		const restPath = sanitizedPath.slice(emptyArrayPosition + 2)
		const arr = get(data, startPath) as TArrType[]

		if(Array.isArray(arr)) {
			for(let i = 0; i < arr.length; i++) {
			// @ts-ignore
				unsetCompact(data, `${startPath}[${i}]${restPath}`)
			}
		}
	}

	// Directly removing an array element is the only way to have an empty array element
	// Handle it separately using slice rather than unset
	if(sanitizedPath.charAt(sanitizedPath.length - 1) === ']') {
		const match = sanitizedPath.match(/(?<index>\d*)\]$/)
		const arr = get(data, sanitizedPath.slice(0, sanitizedPath.lastIndexOf('[')))

		if(Array.isArray(arr) && match?.groups?.index !== undefined) {
			arr.splice(Number(match.groups.index), 1)
		}
	} else {
		unset(data, sanitizedPath)
	}
}
