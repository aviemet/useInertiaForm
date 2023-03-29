import React from 'react'
import { isPlainObject, unset, get, set } from 'lodash'
import { type NestedObject } from './useInertiaForm'

export const createContext = <CT extends unknown | null>() => {
	const context = React.createContext<CT | undefined>(null)

	const useContext = <T extends CT = CT>() => {
		const c = React.useContext<T>(
			(context as unknown) as React.Context<T>,
		)
		if(c === null) {
			throw new Error('useContext must be inside a Provider with a value')
		}
		return c
	}

	return [useContext, context.Provider] as const
}

type TArrType = string|number|NestedObject
export const unsetCompact = (data: NestedObject, path: string) => {
	unset(data, path)

	let position = path.indexOf('[')
	while(position >= 0) {
		const arrPath = path.slice(0, position)
		// @ts-ignore - No way to tell TS that this will be an array
		const arr = get(data, arrPath) as TArrType[]
		set(data, arrPath, arr.filter(a => a))

		position = path.indexOf('[', position + 1)
	}
}

export const fillEmptyValues = <TForm>(data: TForm) => {
	const clone = structuredClone(data)

	for(const key in clone) {
		if(isPlainObject(clone[key])) {
			// @ts-ignore
			clone[key] = fillEmptyValues(clone[key])
		} else if(Array.isArray(clone[key])) {
			// @ts-ignore
			clone[key] = clone[key].map(el => fillEmptyValues(el))
		} else if(clone[key] === undefined || clone[key] === null) {
			// @ts-ignore
			clone[key] = ''
		}
	}

	return clone
}

/**
 * Appends a string to the end of parts of a dot notated string,
 *   excepting those with array notation, and the first and last elements
 */
export const renameWithAttributes = (str: string, append = '_attributes') => {
	const parts = str.split('.')

	if(parts.length < 2) return str

	for(let i = parts.length - 2; i > 0; i--) {
		if(parts[i].charAt(parts[i].length - 1) !== ']') {
			parts[i] = `${parts[i]}${append}`
		} else {
			parts[i].replace('[', '_attributes[')
		}
	}

	return parts.join('.')
}

/**
 * Removes appended string '_attributes' from dot notation
 */
export const stripAttributes = (str: string, attribute = '_attributes') => {
	return str.replace(new RegExp(`${attribute}\\.`), '.')
}

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

export const coerceArray = (arg: string | string[]) => {
	if(Array.isArray(arg)) return arg
	return [arg]
}
