import { useForm } from './Form'
import { useNestedAttribute } from './NestedFields'

type TInputPropsStrategy = (model: string | undefined, name: string) => {
	inputId: string
	inputName: string
}

const inputPropsStrategy: TInputPropsStrategy = (model, name) => {
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
		inputId: `${model}_${name}`,
		inputName,
	}
}

const useInertiaInput = (name: string, model?: string) => {
	const form = useForm()

	let usedModel = model ?? form.model

	try {
		const nested = useNestedAttribute()
		usedModel += `.${nested}`
	} catch (e) {}

	const { inputName, inputId } = inputPropsStrategy(usedModel, name)

	return {
		form,
		inputName,
		inputId,
		value: form.getData(inputName),
		setValue: (value: any) => {
			return form.setData(inputName, value)
		},
		error: form.getError(inputName),
	}
}

export default useInertiaInput
