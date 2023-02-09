import { type InertiaFormProps as DefaultInertiaFormProps } from '@inertiajs/inertia-react'
import { type AxiosResponse } from 'axios' 

declare global {
	type HTTPVerb = 'post' | 'put' | 'get' | 'patch' | 'delete'

	interface InertiaFormProps<TForm = Record<string, any>> extends Omit<DefaultInertiaFormProps, 'errors'> {
		errors: Record<keyof TForm, string|string[]>
		getData: (key: string) => any
		unsetData: (key: string) => void
		getError: (data: string) => string
	}

	export namespace Inertia {
		type Errors = Record<string|number|symbol, string|string[]>

		interface FormProps<TForm = Record<string, any>> extends InertiaFormProps {
			model?: string
			method: HTTPVerb
			to?: string
			getData: (key: string) => any
			getError: (data: string) => string
			unsetData: (key: string) => void
			submit: () => Promise<AxiosResponse<any> | InertiaFormProps | void>
		}
	}
}
