import React, { useEffect, useReducer } from 'react'
import { createContext } from './utils'
import axios from 'axios'
import useInertiaForm from './useInertiaForm'
import { get, set, unset } from 'lodash'

import { type UseInertiaFormProps } from './useInertiaForm'
import { type AxiosResponse } from 'axios'

export type HTTPVerb = 'post' | 'put' | 'get' | 'patch' | 'delete'

export interface UseFormProps<T = Record<string, unknown>> extends UseInertiaFormProps<T> {
	model?: string
	method: HTTPVerb
	to?: string
	getData: (key: string) => unknown
	getError: (data: string) => string|undefined
	unsetData: (key: string) => void
	submit: () => Promise<AxiosResponse<any> | UseInertiaFormProps | void>
}

const [useForm, FormProvider] = createContext<UseFormProps>()
export { useForm }

export type FormMetaValue = {
	nestedAttributes: Set<string>
	addAttribute: (attribute: string) => void
	model?: string
}

const [useFormMeta, FormMetaProvider] = createContext<FormMetaValue>()
export { useFormMeta }

export interface FormComponentProps<T> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onChange'|'onSubmit'|'onError'> {
	data: T
	model?: string
	method?: HTTPVerb
	to?: string
	async?: boolean
	grid?: boolean
	remember?: boolean
	renameNestedAttributes?: false | ((attribute: string) => string)
	onSubmit?: (form: UseFormProps) => boolean|void
	onChange?: (form: UseFormProps) => void
	onSuccess?: (form: UseFormProps) => void
	onError?: (form: UseFormProps) => void
}

const Form = <T extends Record<keyof T, unknown>>(
	{
		children,
		model,
		data,
		method = 'post',
		to,
		async = false,
		remember = true,
		renameNestedAttributes = attribute => `${attribute}_attributes`,
		onSubmit,
		onChange,
		onSuccess,
		onError,
		className,
		...props
	}: FormComponentProps<T>,
	ref: React.ForwardedRef<HTMLFormElement>,
) => {
	const attributesReducer = (state: Set<string>, attribute: string) => {
		const newState = new Set(state)
		newState.add(attribute)
		return newState
	}

	const [nestedAttributes, addAttribute] = useReducer(attributesReducer, new Set<string>())
	const metaValues: FormMetaValue = {
		nestedAttributes,
		addAttribute,
		model,
	}

	const form = remember ? useInertiaForm(`${method}/${model}`, data) : useInertiaForm(data)

	// Expand Inertia's form object to include other useful data
	const contextValueObject: () => UseFormProps = () => ({ ...form, model, method, to, submit })

	/**
	 * Submits the form. If async prop is true, submits using axios,
	 * otherwise submits using Inertia's form methods
	 * @returns Promise
	 */
	const submit = async () => {
		let shouldSubmit = onSubmit && onSubmit(contextValueObject()) === false ? false : true

		if(shouldSubmit && to) {

			// Transform nested attributes, concatenating '_attributes' for Rails controllers
			if(renameNestedAttributes !== false && nestedAttributes.size > 0) {
				form.transform(submitData => {
					nestedAttributes.forEach(attribute => {
						set(
							submitData,
							`${model}.${renameNestedAttributes(attribute)}`,
							get(submitData, `${model}.${attribute}`),
						)
						unset(submitData, `${model}.${attribute}`)
					})
					return submitData
				})
			}

			if(async) {
				return axios[method](to, form.data)
			} else {
				return form[method](to)
			}
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		e.stopPropagation()

		submit()
	}

	// Reset form after succesful submit
	useEffect(() => {
		form.reset()
	}, [form.wasSuccessful])

	// Set values from url search params. Allows for prefilling form data from a link
	useEffect(() => {
		const url = new URL(window.location.href)
		url.searchParams.forEach((value, key) => {
			form.setData(key, value)
		})
	}, [])

	// Callbacks
	useEffect(() => {
		if(onChange) onChange(contextValueObject())
	}, [form.data])

	useEffect(() => {
		if(onError) onError(contextValueObject())
	}, [form.errors])

	useEffect(() => {
		if(onSuccess && form.wasSuccessful) onSuccess(contextValueObject())
	}, [form.wasSuccessful])

	return (
		<FormProvider value={ contextValueObject() }>
			<FormMetaProvider value={ metaValues }>
				<form
					onSubmit={ handleSubmit }
					ref={ ref }
					{ ...props }
				>
					{ children }
				</form>
			</FormMetaProvider>
		</FormProvider>
	)
}

export default React.forwardRef(Form)
