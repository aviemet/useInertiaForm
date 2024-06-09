import { isPlainObject } from 'lodash'
import { NestedObject } from '../useInertiaForm'

/**
 * Append string (default of '_attributes') to keys of nested records
 */
export const renameObjectWithAttributes = <T>(data: T, str = '_attributes') => {
	const clone = structuredClone(data)

	// Start at one level deep
	Object.values(clone).forEach(value => {
		if(isPlainObject(value)){
			recursiveAppendString(value, str)
		}
	})
	return clone
}

const recursiveAppendString = (data: NestedObject, str) => {
	Object.entries(data).forEach(([key, value]) => {
		if(isPlainObject(value)) {
			renameKey(data, key, `${key}${str}`)
			// @ts-ignore - Can't figure out how to type arbitrarily deep nested objects
			recursiveAppendString(value, str)
		} else if(Array.isArray(value)) {
			renameKey(data, key, `${key}${str}`)
		}
	})
}

const renameKey = (obj, oldKey, newKey) => {
	if(oldKey !== newKey) {
		obj[newKey] = obj[oldKey]
		delete obj[oldKey]
	}
}
