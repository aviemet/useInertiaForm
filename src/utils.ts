import React from 'react'
import { isPlainObject, unset, get, set, isEmpty } from 'lodash'
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
 * Removes appended string (default of '_attributes') from dot notation
 */
export const stripAttributes = (str: string, attribute = '_attributes') => {
	return str.replace(new RegExp(`${attribute}\\.`), '.')
}

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

export const coerceArray = <T = unknown>(arg: T | T[]) => Array.isArray(arg) ? arg : [arg]

/**
 * Returns whether a value should be considered empty in the context of a form input
 */
export const isUnset = (v: any) => {
	if(typeof v === 'string') {
		return v === ''
	}

	if(typeof v === 'number') {
		return v === 0 ? false : !Boolean(v)
	}

	return isEmpty(v)
}

// Copied from https://gist.github.com/balthild/1f23725059aef8b9231d6c346494b918
// which was copied from https://twitter.com/diegohaz/status/1309489079378219009
type PathImpl<T, K extends keyof T> =
	K extends string
		? T[K] extends Record<string, any>
			? T[K] extends ArrayLike<any>
				? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}`
				: K | `${K}.${PathImpl<T[K], keyof T[K]>}`
			: K
		: never

export type Path<T> = PathImpl<T, keyof T> | Extract<keyof T, string>

export type PathValue<T, P extends Path<Required<T>>> =
	P extends `${infer K}.${infer Rest}`
		? K extends keyof Required<T>
			? Rest extends Path<Required<T>[K]>
				? PathValue<Required<T>[K], Rest>
				: never
			: never
		: P extends keyof Required<T>
			? Required<T>[P]
			: never
