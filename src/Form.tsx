import React, { useEffect, useReducer, useCallback } from 'react'
import { FormProps } from 'react-html-props'
import { createContext } from './utils'
import axios from 'axios'
import useInertiaForm from './useInertiaForm'
import { get, set, unset } from 'lodash'

const [useForm, FormProvider] = createContext<Inertia.FormProps>()
export { useForm }

type TFormMetaValue = {
	nestedAttributes: Set<string>
	addAttribute: (attribute: string) => void
	model?: string
}

const [useFormMeta, FormMetaProvider] = createContext<TFormMetaValue>()
export { useFormMeta }

export type TInputType = 'button'|'checkbox'|'color'|'currency'|'date'|'datetime-local'|'email'|'file'|'hidden'|'image'|'month'|'number'|'password'|'radio'|'range'|'reset'|'search'|'select'|'submit'|'tel'|'text'|'textarea'|'time'|'url'

interface IFormProps<T> extends Omit<FormProps, 'onChange'|'onSubmit'|'onError'> {
	data: T
	model?: string
	method?: HTTPVerb
	to?: string
	async?: boolean
	grid?: boolean
	remember?: boolean
	renameNestedAttributes?: false | ((attribute: string) => string)
	onSubmit?: (object: Inertia.FormProps) => boolean|void
	onChange?: (object: Inertia.FormProps) => void
	onSuccess?: (object: Inertia.FormProps) => void
	onError?: (object: Inertia.FormProps) => void
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
	}: IFormProps<T>,
	ref: React.ForwardedRef<HTMLFormElement>,
) => {
	const attributesReducer = (state: Set<string>, attribute: string) => {
		const newState = new Set(state)
		newState.add(attribute)
		return newState
	}

	const [nestedAttributes, addAttribute] = useReducer(attributesReducer, new Set<string>())
	const metaValues: TFormMetaValue = {
		nestedAttributes,
		addAttribute,
		model,
	}

	const form = remember ? useInertiaForm(`${method}/${model}`, data) : useInertiaForm(data)

	// Expand Inertia's form object to include other useful data
	// TS type definition is in app/frontend/types/inertia.d.ts
	// Uses useCallback to force re-render when form.data changes
	const contextValueObject: () => Inertia.FormProps = useCallback(() => ({ ...form, model, method, to, submit }), [form.data])

	/**
	 * Submits the form. If async was passed to the Form component, submits using axios,
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

	// Conditional calls to callbacks
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

export default React.memo(React.forwardRef(Form))
