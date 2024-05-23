import { useForm } from '../Form'
import { useNestedAttribute } from '../NestedFields'
import inputStrategy, { type InputStrategy } from './inputStrategy'
import { type NestedObject } from '../useInertiaForm'
import { useEffect } from 'react'

export interface UseInertiaInputProps {
	name: string
	model?: string
	errorKey?: string
	strategy?: InputStrategy
	clearErrorsOnChange?: boolean
}

/**
 * Returns form data and input specific methods to use with an input.
 */
const useInertiaInput = <T = number|string, TForm = NestedObject>({
	name,
	model,
	errorKey,
	strategy = inputStrategy,
	clearErrorsOnChange = true,
}: UseInertiaInputProps) => {
	const form = useForm<TForm>()

	let usedModel = model ?? form.model

	try {
		const nested = useNestedAttribute()
		usedModel += `.${nested}`
	} catch(e) {}


	const { inputName, inputId } = strategy(name, usedModel)

	const value = form.getData(inputName) as T
	const usedErrorKey = errorKey ?? inputName
	const error = form.getError(usedErrorKey)

	// Clear errors when input value changes
	useEffect(() => {
		if(!clearErrorsOnChange || !error) return
		form.clearErrors(usedErrorKey)
	}, [value])

	return {
		form,
		inputName: inputName,
		inputId,
		value,
		setValue: (value: T) => {
			return form.setData(inputName, value)
		},
		error,
	}
}

export default useInertiaInput
