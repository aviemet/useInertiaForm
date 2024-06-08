import React from 'react'
import { isPlainObject, unset, get, set, isEmpty } from 'lodash'
import { type NestedObject } from './useInertiaForm'

/**
 * Creates context with simplified type notations
 * Wraps useContext hook in an error check to enforce context context
 */
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

/**
 * Extends _.unset to remove empty array elements after unsetting an array by index
 *   e.g. unset(data, 'path[0]')
 * Allows special syntax of '[]' to refer to every element of an array
 *   e.g. unset(data, 'path[].key'), will recursively unset 'key' in every array element
 */
type TArrType = string|number|NestedObject
export const unsetCompact = (data: NestedObject, path: string) => {
	const emptyArrayPosition = path.indexOf('[].')
	if(emptyArrayPosition >= 0) {
		console.log({ emptyArrayPosition })
		const restPath = path.slice(emptyArrayPosition + 3)
		const arr = get(data, restPath) as TArrType[]

		arr.forEach((el, i) => {
			// @ts-ignore
			unsetCompact(el, restPath)
			arr[i] = el
		})
		console.dir({ data, restPath, arr }, { depth: null })
		set(data, restPath, arr.filter(a => a))
	}

	unset(data, path)

	let position = path.indexOf('[')

	if(position >= 0) {
		const arrPath = path.slice(0, position)
		const arr = get(data, arrPath) as TArrType[]


		set(data, arrPath, arr.filter(a => a))

		position = path.indexOf('[', position + 1)
	}
}

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

// Added recursion limit to path types to prevent the error:
// "Type instantiation is excessively deep and possibly infinite"
type Increment<A extends any[]> = [0, ...A];

type PathImpl<T, K extends keyof T, A extends any[] = []> =
	A['length'] extends 5 ? never :
		K extends string
			? T[K] extends Record<string, any>
				? T[K] extends ArrayLike<any>
					? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>, Increment<A>>}`
					: K | `${K}.${PathImpl<T[K], keyof T[K], Increment<A>>}`
				: K
			: never;

export type Path<T> = PathImpl<T, keyof T> | Extract<keyof T, string>;

export type PathValue<T, P extends Path<Required<T>>> =
	P extends `${infer K}.${infer Rest}`
		? K extends keyof Required<T>
			? Rest extends Path<Required<T>[K]>
				? PathValue<Required<T>[K], Rest>
				: never
			: never
		: P extends keyof Required<T>
			? Required<T>[P]
			: never;

// Copied from https://gist.github.com/balthild/1f23725059aef8b9231d6c346494b918
// which was copied from https://twitter.com/diegohaz/status/1309489079378219009
/*type PathImpl<T, K extends keyof T, D extends number = 5> =
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
*/
