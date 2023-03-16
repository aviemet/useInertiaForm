import React, { forwardRef, useEffect } from 'react'
import { createContext, renameObjectWithAttributes } from '../utils'
import axios from 'axios'
import useInertiaForm from '../useInertiaForm'
import { type UseInertiaFormProps } from '../useInertiaForm'
import { type AxiosResponse } from 'axios'
import { type Visit } from '@inertiajs/core'
import { NestedObject } from '../types'

export type HTTPVerb = 'post' | 'put' | 'get' | 'patch' | 'delete'

export interface UseFormProps<T = NestedObject> extends UseInertiaFormProps<T> {
	model?: string
	method: HTTPVerb
	to?: string
	getData: (key: string) => unknown
	getError: (data: string) => string|string[]|undefined
	unsetData: (key: string) => void
	submit: () => Promise<AxiosResponse<any> | UseInertiaFormProps | void>
}

const [useForm, FormProvider] = createContext<UseFormProps>()
export { useForm }

export interface FormComponentProps<T> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onChange'|'onSubmit'|'onError'|'errors'> {
	data: T
	model?: string
	method?: HTTPVerb
	to?: string
	async?: boolean
	grid?: boolean
	remember?: boolean
	railsAttributes?: boolean
	onSubmit?: (form: UseFormProps) => boolean|void
	onChange?: (form: UseFormProps) => void
	onSuccess?: (form: UseFormProps) => void
	onError?: (form: UseFormProps) => void
}

const Form = <T extends Record<keyof T, NestedObject>>(
	{
		children,
		model,
		data,
		method = 'post',
		to,
		async = false,
		remember = true,
		railsAttributes = false,
		onSubmit,
		onChange,
		onSuccess,
		onError,
		...props
	}: FormComponentProps<T>,
	ref: React.ForwardedRef<HTMLFormElement>,
) => {
	const defaultData = railsAttributes ? renameObjectWithAttributes(data) : data
	const form = remember ? useInertiaForm(`${method}/${model}`, defaultData) : useInertiaForm(defaultData)

	// Expand Inertia's form object to include other useful data
	const contextValueObject: () => UseFormProps = () => ({ ...form, model, method, to, submit })

	/**
	 * Submits the form. If async prop is true, submits using axios,
	 * otherwise submits using Inertia's `useForm.submit` method
	 */
	const submit = async (options?: Partial<Visit>) => {
		let shouldSubmit = to && onSubmit && onSubmit(contextValueObject()) === false ? false : true

		if(shouldSubmit) {
			if(async) {
				return axios[method](to, form.data)
			} else {
				return form.submit(method, to, options)
			}
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		e.stopPropagation()

		submit()
	}

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
		if(!form.wasSuccessful) return

		form.reset()
		if(onSuccess) onSuccess(contextValueObject())
	}, [form.wasSuccessful])

	return (
		<FormProvider value={ contextValueObject() }>
			<form onSubmit={ handleSubmit } ref={ ref } { ...props }>
				{ children }
			</form>
		</FormProvider>
	)
}

export default forwardRef(Form)
