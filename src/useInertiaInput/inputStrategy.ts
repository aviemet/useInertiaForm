import { renameWithAttributes } from '../utils'

export type InputStrategy = (name: string, model?: string) => {
	inputId: string
	inputName: string
}

/**
 * Standard input strategy:
 *  name: dot notation with array awareness
 *  model: snake case based on nested models and input name
 */
const inputStrategy: InputStrategy = (name, model) => {
	if(!model) {
		return {
			inputId: name,
			inputName: renameWithAttributes(name),
		}
	}

	let inputName: string

	if(name.charAt(0) === '[') {
		inputName = `${model}${name}`
	} else {
		inputName = `${model}.${(name)}`
	}

	return {
		inputId: `${model.replace('.', '_')}_${name}`.replace(/\[(\d)\]/, '_$1'),
		inputName: renameWithAttributes(inputName),
	}
}

export default inputStrategy
