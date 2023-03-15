import { unsetCompact, fillEmptyValues } from './utils'
import { useForm } from '@inertiajs/react'
import { set, get } from 'lodash'
import { useCallback, useRef } from 'react'
import type { InertiaFormProps } from '@inertiajs/react/types/useForm'
import { type NestedObject } from './types'

type setDataByObject<TForm> = (data: TForm) => void;
type setDataByMethod<TForm> = (data: (previousData: TForm) => TForm) => void;
type setDataByKeyValuePair = (key: string, value: unknown) => void;

type setData<TForm> = (key: string | TForm | ((data: TForm) => TForm), value?: unknown) => void

export interface UseInertiaFormProps<TForm = NestedObject> extends
	Omit<InertiaFormProps<Record<keyof TForm, unknown>>, 'data'|'errors'|'setDefaults'|'reset'|'clearErrors'|'setError'|'setData'>
{
	data: TForm
	errors: Record<string, string|string[]>
	setDefaults(field: string, value: string): void
	setDefaults(fields: Record<string, string>): void
	reset: (...fields: (string)[]) => void
	clearErrors: (...fields: (string)[]) => void
	setError(field: string, value: string): void
	setError(errors: Record<string, string>): void

	// New methods to useInertiaForm
	setData: setDataByObject<TForm> & setDataByMethod<TForm> & setDataByKeyValuePair
	getData: (key: string) => unknown
	unsetData: (key: string) => void
	getError: (data: string) => string|string[]|undefined
}

function useInertiaForm<TForm extends NestedObject>(initialValues?: TForm): UseInertiaFormProps<TForm>
function useInertiaForm<TForm extends NestedObject>(rememberKey: string, initialValues?: TForm): UseInertiaFormProps<TForm>

function useInertiaForm<TForm extends NestedObject>(
	rememberKeyOrInitialValues?: string | TForm,
	maybeInitialValues?: TForm,
): UseInertiaFormProps<TForm> {
	const transformCallbackRef = useRef<(data: TForm) => TForm>()
	const rememberKey = typeof rememberKeyOrInitialValues === 'string' ? rememberKeyOrInitialValues : null

	let form: InertiaFormProps<TForm>
	if(rememberKey) {
		form = useForm<TForm>(rememberKey, fillEmptyValues(maybeInitialValues))
	} else {
		// @ts-ignore - Inertia's useForm type doesn't support nested objects, but the implementation does
		form = useForm<TForm>(fillEmptyValues(rememberKeyOrInitialValues))
	}

	/**
	 * Override Inertia's setData method to allow setting nested values
	 */
	const setData: setData<TForm> = (key, value?) => {
		if(typeof key === 'string'){
			form.setData((formData: TForm) => {
				return set(structuredClone(formData), key, value)
			})
		} else {
			/*
			Argument of type 'TForm | ((data: TForm) => TForm)' is not assignable to parameter of type 'keyof TForm'.
				Type 'TForm' is not assignable to type 'keyof TForm'.
					Type 'NestedObject' is not assignable to type 'keyof TForm'.
						Type 'NestedObject' is not assignable to type 'string | number'.
							Type 'TForm' is not assignable to type 'string | number'.
								Type 'NestedObject' is not assignable to type 'string | number'.ts(2345)
			*/
			// @ts-ignore - key is not a string below, all errors are expecting a string
			form.setData(key, value)
		}
	}

	/**
	 * Getter for nested values of form data
	 */
	const getData = (key: string): unknown => {
		return get(form.data, key)
	}

	/**
	 * Getter for nested error values of form errors
	 */
	const getError = (key: string): string|string[] => {
		return get(form.errors, key)
	}

	/**
	 * Remove key/value pair by dot-notated key
	 */
	const unsetData = (key: string) => {
		const clone = structuredClone(form.data)
		unsetCompact(clone, key)

		return setData(clone)
	}

	/**
	 * Fix for transform method until Inertia team fixes it
	 */
	const transform = useCallback((callback: (data: TForm ) => TForm) => {
		transformCallbackRef.current = callback
	}, [form.data])

	/**
	 * Proxying the submit method allows us to call transform just before the original method is called,
	 * but with the memoized transform method which won't be overwritten by renders
	 */
	const submit: typeof form.submit = (method, url, options = {}) => {
		form.transform(transformCallbackRef.current)
		form.submit(method, url, options)
	}

	return {
		...form,
		setData,
		getData,
		getError,
		unsetData,
		transform,
		submit,
	}
}

export default useInertiaForm
