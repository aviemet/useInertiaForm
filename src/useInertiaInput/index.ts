import { useForm } from '../Form'
import { useNestedAttribute } from '../NestedFields'
import inputStrategy, { type InputStrategy } from './inputStrategy'

interface UseInertiaInputProps {
	name: string
	model?: string
	strategy?: InputStrategy
}

/**
 * Returns form data and input specific methods to use with an input.
 */
const useInertiaInput = <T = number|string>({ name, model, strategy = inputStrategy }: UseInertiaInputProps) => {
	const form = useForm()

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
		error: form.getError(name),
	}
}

export default useInertiaInput
