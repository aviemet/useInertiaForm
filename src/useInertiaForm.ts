import { unsetCompact, fillEmptyValues } from './utils'
import { useForm } from '@inertiajs/react'
import { cloneDeep, set, get } from 'lodash'
import { useCallback } from 'react'
import type { InertiaFormProps as DefaultInertiaFormProps } from '@inertiajs/react/types/useForm'

export interface UseInertiaForm<TForm = Record<string, unknown>> extends Omit<DefaultInertiaFormProps<Record<string, unknown>>, 'errors'> {
	errors?: Partial<Record<keyof TForm, string|string[]>>
	getData: (key: string) => any
	unsetData: (key: string) => void
	getError: (data: string) => string|undefined
}

function useInertiaForm<TForm = Record<string, any>>(initialValues?: TForm): UseInertiaForm<TForm>
function useInertiaForm<TForm = Record<string, any>>(rememberKey: string, initialValues?: TForm): UseInertiaForm<TForm>

function useInertiaForm<TForm extends Record<string, unknown>>(
	rememberKeyOrInitialValues?: string | TForm,
	maybeInitialValues?: TForm,
): UseInertiaForm {
	const rememberKey = typeof rememberKeyOrInitialValues === 'string' ? rememberKeyOrInitialValues : null
	const initialValues = fillEmptyValues(typeof rememberKeyOrInitialValues === 'string' ? (maybeInitialValues || {}) : rememberKeyOrInitialValues || {}) || {}

	let form: DefaultInertiaFormProps<typeof initialValues>
	if(rememberKey) {
		form = useForm<typeof initialValues>(rememberKey, initialValues)
	} else {
		form = useForm<typeof initialValues>(initialValues)
	}

	type SetDataKey = string | Record<string, any> | ((data: Record<string, any>) => Record<string, any>)

	/**
	 * Override Inertia's setData method to allow setting nested values
	 */
	const setData: UseInertiaForm['setData'] = (key: SetDataKey, value?: any) => {
		if(typeof key === 'string'){
			form.setData((data: Record<string, any>) => {
				return set(cloneDeep(data), key, value)
			})
		} else {
			form.setData(key)
		}
	}

	/**
	 * Getter for nested values of form data
	 */
	const getData = (key: string): any => {
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


	type TransformCallBack = (data: Record<string, any>) => Record<string, any>

	/**
	 * Fix for transform method until Inertia team fixes it
	 */
	const transform = useCallback((cb: TransformCallBack) => {
		form.transform(() => cb(cloneDeep(form.data)))
	}, [form.data])

	return { ...form, setData, getData, getError, unsetData, transform }
}

export default useInertiaForm
