import React from 'react'
import { cloneDeep, isPlainObject, unset, get, set } from 'lodash'

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

type TArrType = string|number|Record<string, unknown>
export const unsetCompact = (data: Record<string, any>, path: string) => {
	unset(data, path)

	let position = path.indexOf('[')
	while(position >= 0) {
		const arrPath = path.slice(0, position)
		const arr = get(data, arrPath)
		const compacted: TArrType[] = []
		arr.forEach((a: TArrType) => compacted.push(a))
		set(data, arrPath, compacted)

		position = path.indexOf('[', position + 1)
	}
}

export const fillEmptyValues = (data: Record<string, any>) => {
	const sanitizedDefaultData = cloneDeep(data)

	for(const key in sanitizedDefaultData) {
		if(isPlainObject(sanitizedDefaultData[key])) {
			sanitizedDefaultData[key] = fillEmptyValues(sanitizedDefaultData[key])
		} else if(sanitizedDefaultData[key] === undefined || sanitizedDefaultData[key] === null) {
			sanitizedDefaultData[key] = ''
		}
	}

	return sanitizedDefaultData
}
