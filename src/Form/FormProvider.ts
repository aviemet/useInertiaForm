import { createContext } from '../utils'
import { type UseInertiaFormProps } from '../useInertiaForm'
import { type AxiosResponse } from 'axios'
import { NestedObject } from '../useInertiaForm'

export type HTTPVerb = 'post' | 'put' | 'get' | 'patch' | 'delete'

export interface UseFormProps<TForm> extends UseInertiaFormProps<TForm> {
	model?: string
	method: HTTPVerb
	to?: string
	getData: (key: string) => unknown
	getError: (key: string) => string|string[]|undefined
	unsetData: (key: string) => void
	submit: () => Promise<AxiosResponse<any> | UseInertiaFormProps<TForm> | void>
}

const [useForm, FormProvider] = createContext<UseFormProps<NestedObject>>()
export { FormProvider, useForm }
