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
