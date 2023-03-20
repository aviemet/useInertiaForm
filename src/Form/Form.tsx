import React, { useEffect, useCallback } from 'react'
import axios from 'axios'
import useInertiaForm from '../useInertiaForm'
import { type Visit } from '@inertiajs/core'
import { NestedObject } from '../useInertiaForm'
import { FormProps, type UseFormProps } from '.'
import { FormProvider } from './FormProvider'

interface FormComponentProps<TForm> extends Omit<FormProps<TForm>, 'railsAttributes'>{}

const Form = <TForm extends NestedObject>({
	children,
	model,
	data,
	method = 'post',
	to,
	async = false,
	remember = true,
	onSubmit,
	onChange,
	onSuccess,
	onError,
	...props
}: FormComponentProps<TForm>) => {

	const form = remember && (model || to) ? useInertiaForm<TForm>(`${method}/${model || to}`, data) : useInertiaForm<TForm>(data)

	const contextValueObject = useCallback((): UseFormProps<TForm> => (
		{ ...form, model, method, to, submit }
	), [form.data])

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
			<form onSubmit={ handleSubmit } { ...props }>
				{ children }
			</form>
		</FormProvider>
	)
}

export default Form
