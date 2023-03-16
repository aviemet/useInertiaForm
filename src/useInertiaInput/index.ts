import { useForm, useFormMeta } from '../Form'
import { useNestedAttribute } from '../NestedFields'
import { renameWithAttributes } from '../utils'
import inputStrategy, { type InputStrategy } from './inputStrategy'

interface UseInertiaInputProps {
	name: string
	model?: string
	strategy?: InputStrategy
}

/**
 * Returns form data and input specific methods to use with an input.
 */
const useInertiaInput = <T = number|string|string[]>({ name, model, strategy = inputStrategy }: UseInertiaInputProps) => {
	const form = useForm()

	let usedModel = model ?? form.model

	try {
		const nested = useNestedAttribute()
		usedModel += `.${nested}`
	} catch(e) {}

	let railsAttributes = false

	try {
		const meta = useFormMeta()
		railsAttributes = meta.railsAttributes
	} catch(e) {}

	const { inputName, inputId } = strategy(name, usedModel)

	const processedInputName = railsAttributes ? renameWithAttributes(inputName) : inputName

	if(name === 'nested.key' && railsAttributes) {
		// console.log({ railsAttributes, inputName, processedInputName, data: form.data })
	}

	return {
		form,
		inputName: processedInputName,
		inputId,
		value: form.getData(processedInputName) as T,
		setValue: (value: T) => {
			return form.setData(processedInputName, value)
		},
		error: form.getError(inputName),
	}
}

export default useInertiaInput
