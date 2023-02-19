import { unsetCompact, fillEmptyValues } from './utils'
import { useForm } from '@inertiajs/react'
import { cloneDeep, set, get } from 'lodash'
import { useCallback } from 'react'
import type { InertiaFormProps as DefaultInertiaFormProps } from '@inertiajs/react/types/useForm'

export interface UseInertiaFormProps<TForm = Record<string, unknown>> extends DefaultInertiaFormProps<Record<keyof TForm, unknown>> {
	getData: (key: string) => unknown
	unsetData: (key: string) => void
	getError: (data: string) => string|undefined
}

function useInertiaForm<TForm extends Record<string, unknown>>(initialValues?: TForm): UseInertiaFormProps<TForm>
function useInertiaForm<TForm extends Record<string, unknown>>(rememberKey: string, initialValues?: TForm): UseInertiaFormProps<TForm>

function useInertiaForm<TForm extends Record<string, unknown>>(
	rememberKeyOrInitialValues?: string | TForm,
	maybeInitialValues?: TForm,
): UseInertiaFormProps<TForm> {
	const rememberKey = typeof rememberKeyOrInitialValues === 'string' ? rememberKeyOrInitialValues : null
	const initialValues = fillEmptyValues(typeof rememberKeyOrInitialValues === 'string' ? (maybeInitialValues || {}) : rememberKeyOrInitialValues || {}) || {}

	let form: DefaultInertiaFormProps<typeof initialValues>
	if(rememberKey) {
		form = useForm<typeof initialValues>(rememberKey, initialValues)
	} else {
		form = useForm<typeof initialValues>(initialValues)
	}

	type SetDataKey = string | Record<string, unknown> | ((data: Record<string, unknown>) => Record<string, unknown>)

	/**
	 * Override Inertia's setData method to allow setting nested values
	 */
	const setData: UseInertiaFormProps['setData'] = (key: SetDataKey, value?: unknown) => {
		if(typeof key === 'string'){
			form.setData((data: TForm) => {
				return set(cloneDeep(data), key, value)
			})
		} else {
			form.setData(key)
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
	const getError = (key: string) => {
		return get(form.errors, key)
	}

	/**
	 * Remove key/value pair by dot-notated key
	 */
	const unsetData = (key: string) => {
		const clone = cloneDeep(form.data)
		unsetCompact(clone, key)

		return setData(clone)
	}

	/**
	 * Fix for transform method until Inertia team fixes it
	 */
	const transform = useCallback((callback: (data: TForm ) => TForm) => {
		form.transform(() => callback(form.data as TForm))
	}, [form.data])

	const { errors } = form

	return { ...form, setData, getData, getError, unsetData, transform }
}

export default useInertiaForm
