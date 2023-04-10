import React from 'react'
import { type UseInertiaFormProps } from '../useInertiaForm'
import { type AxiosResponse } from 'axios'
import { NestedObject } from '../useInertiaForm'

export type HTTPVerb = 'post' | 'put' | 'get' | 'patch' | 'delete'

export interface UseFormProps<TForm = NestedObject> extends UseInertiaFormProps<TForm> {
	model?: string
	method: HTTPVerb
	to?: string
	submit: () => Promise<AxiosResponse<any> | UseInertiaFormProps<TForm> | void>
}

export const createContext = <CT extends unknown | null>() => {
	const context = React.createContext<CT | undefined>(null)

	const useContext = <T extends CT = CT>() => {
		const c = React.useContext<UseFormProps<T>>(
			(context as unknown) as React.Context<UseFormProps<T>>,
		)
		if(c === null) {
			throw new Error('useContext must be inside a Provider with a value')
		}
		return c
	}

	return [useContext, context.Provider] as const
}

const [useForm, FormProvider] = createContext()
export { FormProvider, useForm }
