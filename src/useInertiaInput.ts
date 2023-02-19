import { useForm } from './Form'
import { useNestedAttribute } from './NestedFields'

export type InputStrategy = (name: string, model?: string) => {
	inputId: string
	inputName: string
}

const inputStrategy: InputStrategy = (name, model) => {
	if(!model) {
		return {
			inputId: name,
			inputName: name,
		}
	}

	let inputName: string

	if(name.charAt(0) === '[') {
		inputName = `${model}${name}`
	} else {
		inputName = `${model}.${name}`
	}

	return {
		inputId: `${model.replace('.', '_')}_${name}`.replace(/\[(\d)\]/, '_$1'),
		inputName,
	}
}

interface UseInertiaInputProps {
	name: string
	model?: string
	strategy?: InputStrategy
}

const useInertiaInput = ({ name, model, strategy = inputStrategy }: UseInertiaInputProps) => {
	const form = useForm()

	let usedModel = model ?? form.model

	try {
		const nested = useNestedAttribute()
		usedModel += `.${nested}`
	} catch(e) {}

	const { inputName, inputId } = strategy(name, usedModel)

	return {
		form,
		inputName,
		inputId,
		value: form.getData(inputName),
		setValue: (value: unknown) => {
			return form.setData(inputName, value)
		},
		error: form.getError(inputName),
	}
}

export default useInertiaInput
