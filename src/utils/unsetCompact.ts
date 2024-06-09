import { unset, get  } from 'lodash'
import { type NestedObject } from '../useInertiaForm'

/**
 * Extends _.unset to remove empty array elements after unsetting an array by index
 *   e.g. unset(data, 'path[0]')
 * Allows special syntax of '[]' to refer to every element of an array
 *   e.g. unset(data, 'path[].key'), will recursively unset 'key' in every array element
 */
type TArrType = string|number|NestedObject
export const unsetCompact = (data: NestedObject, path: string) => {
	// Handle special empty array syntax
	if(path.includes('[]')) {
		const emptyArrayPosition = path.indexOf('[]')
		const startPath = path.slice(0, emptyArrayPosition)
		const restPath = path.slice(emptyArrayPosition + 2)
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
	if(path.charAt(path.length - 1) === ']') {
		const match = path.match(/(?<index>\d*)\]$/)
		const arr = get(data, path.slice(0, path.lastIndexOf('[')))

		if(Array.isArray(arr) && match?.groups?.index !== undefined) {
			arr.splice(Number(match.groups.index), 1)
		}
	} else {
		unset(data, path)
	}
}
