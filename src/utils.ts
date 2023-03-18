import React from 'react'
import { isPlainObject, unset, get, set } from 'lodash'
import { type NestedObject } from './types'

export const createContext = <T extends {} | null>() => {
	const ctx = React.createContext<T | undefined>(undefined)

	const useCtx = () => {
		const c = React.useContext(ctx)
		if(c === undefined) {
			throw new Error('useCtx must be inside a Provider with a value')
		}
		return c
	}

	return [useCtx, ctx.Provider] as const
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

export const fillEmptyValues = <TForm extends NestedObject>(data: TForm) => {
	const sanitizedDefaultData = structuredClone(data)

	for(const key in sanitizedDefaultData) {
		if(isPlainObject(sanitizedDefaultData[key])) {
			// @ts-ignore
			sanitizedDefaultData[key] = fillEmptyValues(sanitizedDefaultData[key])
		} else if(sanitizedDefaultData[key] === undefined || sanitizedDefaultData[key] === null) {
			// @ts-ignore
			sanitizedDefaultData[key] = ''
		}
	}

	return sanitizedDefaultData
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

export const renameObjectWithAttributes = <T extends NestedObject>(data: T, str = '_attributes') => {
	const clone = structuredClone(data)

	// Start at one level deep
	Object.values(clone).forEach(value => {
		if(isPlainObject(value)){
		// @ts-ignore - Can't figure out how to type arbitrarily deep nested objects
			recursiveRename(value, str)
		}
	})
	return clone
}

const recursiveRename = (data: NestedObject, str) => {
	Object.entries(data).forEach(([key, value]) => {
		if(isPlainObject(value)) {
			renameKey(data, key, `${key}${str}`)
			// @ts-ignore - Can't figure out how to type arbitrarily deep nested objects
			recursiveRename(value, str)
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
