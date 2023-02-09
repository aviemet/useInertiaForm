import { type AxiosResponse } from 'axios' 
import type { InertiaFormProps as DefaultInertiaFormProps } from '@inertiajs/react/types/useForm'

declare global {
	type HTTPVerb = 'post' | 'put' | 'get' | 'patch' | 'delete'

	interface InertiaFormProps<TForm = Record<string, unknown>> extends Omit<DefaultInertiaFormProps<Record<string, unknown>>, 'errors'> {
		errors?: Partial<Record<keyof TForm, string|string[]>>
		getData: (key: string) => any
		unsetData: (key: string) => void
		getError: (data: string) => string|undefined
	}

	export namespace Inertia {
		type Errors = Record<string|number|symbol, string|string[]>

		interface FormProps<TForm = Record<string, any>> extends InertiaFormProps {
			model?: string
			method: HTTPVerb
			to?: string
			getData: (key: string) => any
			getError: (data: string) => string|undefined
			unsetData: (key: string) => void
			submit: () => Promise<AxiosResponse<any> | InertiaFormProps | void>
		}
	}
}
