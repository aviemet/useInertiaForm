import { useEffect, useRef } from 'react'
import { useForm } from '../Form'
import { useNestedAttribute } from '../NestedFields'
import inputStrategy, { type InputStrategy } from './inputStrategy'
import { type NestedObject } from '../useInertiaForm'

export interface UseInertiaInputProps<T = string|number|boolean> {
	name: string
	model?: string
	defaultValue?: T
	errorKey?: string
	strategy?: InputStrategy
	clearErrorsOnChange?: boolean
}

/**
 * Returns form data and input specific methods to use with an input.
 */
const useInertiaInput = <T = string|number|boolean, TForm = NestedObject>({
	name,
	model,
	defaultValue,
	errorKey,
	strategy = inputStrategy,
	clearErrorsOnChange = true,
}: UseInertiaInputProps<T>) => {
	const form = useForm<TForm>()

	let usedModel = model ?? form.model
	try {
		const nested = useNestedAttribute()
		usedModel += `.${nested}`
	} catch(e) {}

	const { inputName, inputId } = strategy(name, usedModel)

	// Add a valid default value to the data object
	const initializingRef = useRef(true)
	if(usedModel === 'values') {
	}
	useEffect(() => {
		if(!initializingRef.current) return

		const inputValue = form.getData(inputName)
		if(inputValue === null || inputValue === undefined) {
			form.setData(inputName, defaultValue || '')
		}

		initializingRef.current = false
	}, [])

	const value = form.getData(inputName) as T
	const usedErrorKey = errorKey ?? inputName
	const error = form.getError(usedErrorKey)

	// Clear errors when input value changes
	useEffect(() => {
		if(initializingRef.current || !clearErrorsOnChange || !error) return

		form.clearErrors(usedErrorKey)
	}, [value])

	return {
		form,
		inputName: inputName,
		inputId,
		value: value ?? '' as T,
		setValue: (value: T) => {
			return form.setData(inputName, value)
		},
		error,
	}
}

export default useInertiaInput
