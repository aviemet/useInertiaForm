import { unsetCompact, fillEmptyValues } from './utils'
import { useForm } from '@inertiajs/inertia-react'
import { cloneDeep, set, get } from 'lodash'
import { useCallback } from 'react'

import { type InertiaFormProps as DefaultInertiaFormProps } from '@inertiajs/inertia-react'

type TCallBack = (data: Record<string, any>) => Record<string, any>

function useInertiaForm<TForm = Record<string, any>>(initialValues?: TForm): InertiaFormProps<TForm>
function useInertiaForm<TForm = Record<string, any>>(rememberKey: string, initialValues?: TForm): InertiaFormProps<TForm>

function useInertiaForm<TForm extends Record<string, unknown>>(
	rememberKeyOrInitialValues?: string | TForm,
	maybeInitialValues?: TForm,
): InertiaFormProps {
	const rememberKey = typeof rememberKeyOrInitialValues === 'string' ? rememberKeyOrInitialValues : null
	const initialValues = fillEmptyValues(typeof rememberKeyOrInitialValues === 'string' ? (maybeInitialValues || {}) : rememberKeyOrInitialValues || {}) || {}

	let form: DefaultInertiaFormProps
	if(rememberKey) {
		form = useForm<typeof initialValues>(rememberKey, initialValues)
	} else {
		form = useForm<typeof initialValues>(initialValues)
	}

	/**
	 * Override Inertia's setData method to allow setting nested values
	 */
	const setData: InertiaFormProps['setData'] = (key: Record<string, any>|string|((data: Record<string, any>) => Record<string, any>), value?: any) => {
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

	/**
	 * Fix for transform method until Inertia team fixes it
	 */
	const transform = useCallback((cb: TCallBack) => {
		form.transform(() => cb(cloneDeep(form.data)))
	}, [form.data])

	return { ...form, setData, getData, getError, unsetData, transform }
}

export default useInertiaForm
