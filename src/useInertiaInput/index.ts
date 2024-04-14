import { useForm } from '../Form'
import { useNestedAttribute } from '../NestedFields'
import inputStrategy, { type InputStrategy } from './inputStrategy'
import { type NestedObject } from '../useInertiaForm'

interface UseInertiaInputProps {
	name: string
	model?: string
	errorKey?: string
	strategy?: InputStrategy
}

/**
 * Returns form data and input specific methods to use with an input.
 */
const useInertiaInput = <T = number|string, TForm = NestedObject>({ name, model, errorKey, strategy = inputStrategy }: UseInertiaInputProps) => {
	const form = useForm<TForm>()

	let usedModel = model ?? form.model

	try {
		const nested = useNestedAttribute()
		usedModel += `.${nested}`
	} catch(e) {}

	const { inputName, inputId } = strategy(name, usedModel)

	return {
		form,
		inputName: inputName,
		inputId,
		value: form.getData(inputName) as T,
		setValue: (value: T) => {
			return form.setData(inputName, value)
		},
		error: form.getError(errorKey ?? inputName),
	}
}

export default useInertiaInput
